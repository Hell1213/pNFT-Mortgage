#!/usr/bin/env node

/**
 * Test creating a loan with the actual deployed program
 */

const {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
} = require("@solana/web3.js");
const { AnchorProvider, Program, Wallet, BN } = require("@coral-xyz/anchor");
const fs = require("fs");

const PROGRAM_ID = new PublicKey(
  "C2kfwjLdi7uJjfNeE25MYqviPcvSokwpxRyrrhYaGCf6"
);
const RPC_URL = "https://api.devnet.solana.com";

async function testCreateLoan() {
  console.log("🧪 Testing Loan Creation with Deployed Program...\n");

  try {
    // 1. Setup connection and wallet
    const connection = new Connection(RPC_URL, "confirmed");
    const secret = JSON.parse(
      fs.readFileSync(process.env.HOME + "/.config/solana/id.json")
    );
    const wallet_keypair = Keypair.fromSecretKey(Uint8Array.from(secret));
    const wallet = new Wallet(wallet_keypair);

    console.log("✅ Wallet loaded:", wallet_keypair.publicKey.toString());

    // 2. Load the actual deployed IDL
    const idl = JSON.parse(
      fs.readFileSync("target/idl/pnft_mortgage_market.json", "utf8")
    );
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = new Program(idl, PROGRAM_ID, provider);

    console.log("✅ Program loaded");
    console.log("Available methods:", Object.keys(program.methods));

    // 3. Check if global state is initialized
    const [globalStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      PROGRAM_ID
    );

    console.log("Global State PDA:", globalStatePda.toString());

    let globalStateAccount;
    try {
      globalStateAccount = await program.account.globalState?.fetch(
        globalStatePda
      );
      console.log("✅ Global state is initialized");
      console.log("Global state:", {
        authority: globalStateAccount.authority.toString(),
        totalLoans: globalStateAccount.totalLoans.toString(),
      });
    } catch (error) {
      console.log("❌ Global state not initialized, initializing now...");

      try {
        const tx = await program.methods
          .initialize()
          .accounts({
            globalState: globalStatePda,
            authority: wallet_keypair.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log("✅ Global state initialized:", tx);
        console.log(
          "Explorer:",
          `https://explorer.solana.com/tx/${tx}?cluster=devnet`
        );

        // Wait for confirmation
        await new Promise((resolve) => setTimeout(resolve, 2000));

        globalStateAccount = await program.account.globalState.fetch(
          globalStatePda
        );
        console.log("✅ Global state created:", {
          authority: globalStateAccount.authority.toString(),
          totalLoans: globalStateAccount.totalLoans.toString(),
        });
      } catch (initError) {
        console.error(
          "❌ Failed to initialize global state:",
          initError.message
        );
        if (initError.logs) {
          console.log("Program logs:");
          initError.logs.forEach((log) => console.log("  ", log));
        }
        return;
      }
    }

    // 4. Generate loan PDA (based on the deployed program structure)
    const [loanPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("loan"), wallet_keypair.publicKey.toBuffer()],
      PROGRAM_ID
    );

    console.log("Loan PDA:", loanPda.toString());

    // 5. Try to create a loan
    console.log("\n🚀 Attempting to create loan...");

    const loanAmount = new BN(1000000000); // 1 SOL in lamports
    const duration = new BN(30 * 24 * 60 * 60); // 30 days in seconds
    const interestRate = new BN(1000); // 10% (basis points)

    console.log("Loan parameters:", {
      amount: loanAmount.toString() + " lamports",
      duration: duration.toString() + " seconds",
      interestRate: interestRate.toString() + " basis points",
    });

    try {
      const tx = await program.methods
        .createLoan(loanAmount, duration, interestRate)
        .accounts({
          loan: loanPda,
          borrower: wallet_keypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([wallet_keypair])
        .rpc();

      console.log("🎉 Loan created successfully!");
      console.log("Transaction:", tx);
      console.log(
        "Explorer:",
        `https://explorer.solana.com/tx/${tx}?cluster=devnet`
      );

      // Fetch the created loan
      const loanAccount = await program.account.loan.fetch(loanPda);
      console.log("Loan details:", {
        borrower: loanAccount.borrower.toString(),
        amount: loanAccount.amount.toString(),
        duration: loanAccount.duration.toString(),
        interestRate: loanAccount.interestRate.toString(),
        status: loanAccount.status,
      });
    } catch (error) {
      console.error("❌ Loan creation failed:", error.message);

      if (error.logs) {
        console.log("\nProgram logs:");
        error.logs.forEach((log) => console.log("  ", log));
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testCreateLoan().catch(console.error);
