#!/usr/bin/env node

/**
 * Test creating a loan directly via terminal
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
  console.log("🧪 Testing Loan Creation via Terminal...\n");

  try {
    // 1. Setup connection and wallet
    const connection = new Connection(RPC_URL, "confirmed");
    const secret = JSON.parse(
      fs.readFileSync(process.env.HOME + "/.config/solana/id.json")
    );
    const wallet_keypair = Keypair.fromSecretKey(Uint8Array.from(secret));
    const wallet = new Wallet(wallet_keypair);

    console.log("✅ Wallet loaded:", wallet_keypair.publicKey.toString());

    // 2. Load IDL and create program
    const idl = JSON.parse(
      fs.readFileSync("frontend/src/lib/idl.json", "utf8")
    );
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = new Program(idl, PROGRAM_ID, provider);

    console.log("✅ Program loaded");
    console.log("Available methods:", Object.keys(program.methods));

    // 3. Check if protocol is initialized
    const [protocolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol")],
      PROGRAM_ID
    );

    console.log("Protocol PDA:", protocolPda.toString());

    let protocolAccount;
    try {
      protocolAccount = await program.account.protocol?.fetch(protocolPda);
      console.log("✅ Protocol is initialized");
    } catch (error) {
      console.log("❌ Protocol not initialized, initializing now...");

      try {
        const tx = await program.methods
          .initialize()
          .accounts({
            protocol: protocolPda,
            authority: wallet_keypair.publicKey,
            treasury: wallet_keypair.publicKey, // Using wallet as treasury for testing
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log("✅ Protocol initialized:", tx);
        protocolAccount = await program.account.protocol.fetch(protocolPda);
      } catch (initError) {
        console.error("❌ Failed to initialize protocol:", initError.message);
        return;
      }
    }

    // 4. Create a dummy NFT mint for testing
    const dummyMint = Keypair.generate();
    const dummyTokenAccount = Keypair.generate();

    console.log("Using dummy mint:", dummyMint.publicKey.toString());
    console.log(
      "Using dummy token account:",
      dummyTokenAccount.publicKey.toString()
    );

    // 5. Generate loan PDA
    const [loanPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("loan"),
        wallet_keypair.publicKey.toBuffer(),
        dummyMint.publicKey.toBuffer(),
      ],
      PROGRAM_ID
    );

    console.log("Loan PDA:", loanPda.toString());

    // 6. Try to create a loan
    console.log("\n🚀 Attempting to create loan...");

    const loanAmount = new BN(1000000000); // 1 SOL in lamports
    const duration = new BN(30 * 24 * 60 * 60); // 30 days in seconds
    const interestRate = 1000; // 10% (basis points)

    console.log("Loan parameters:", {
      amount: loanAmount.toString() + " lamports",
      duration: duration.toString() + " seconds",
      interestRate: interestRate + " basis points",
    });

    try {
      // Create a lender keypair (for testing, same as borrower)
      const lenderKeypair = wallet_keypair; // In real app, this would be different

      const tx = await program.methods
        .createLoan(loanAmount, duration, interestRate)
        .accounts({
          borrower: wallet_keypair.publicKey,
          lender: lenderKeypair.publicKey,
          collateralMint: dummyMint.publicKey,
          collateralToken: dummyTokenAccount.publicKey,
          loan: loanPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([wallet_keypair, lenderKeypair])
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
        lender: loanAccount.lender.toString(),
        amount: loanAccount.loanAmount.toString(),
        status: loanAccount.status,
      });
    } catch (error) {
      console.error("❌ Loan creation failed:", error.message);

      if (error.logs) {
        console.log("\nProgram logs:");
        error.logs.forEach((log) => console.log("  ", log));
      }

      // Check specific error types
      if (error.message.includes("InsufficientLiquidity")) {
        console.log("\n💡 This is the liquidity issue we identified!");
        console.log(
          "The program is working, but the lender pool needs liquidity."
        );
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testCreateLoan().catch(console.error);
