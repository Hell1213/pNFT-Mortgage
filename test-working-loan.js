#!/usr/bin/env node

const {
  Connection,
  PublicKey,
  SystemProgram,
  Keypair,
} = require("@solana/web3.js");
const { AnchorProvider, Program, Wallet, BN } = require("@coral-xyz/anchor");
const fs = require("fs");

// USE THE ORIGINAL PROGRAM ID - NO MORE CHANGES!
const PROGRAM_ID = new PublicKey(
  "C2kfwjLdi7uJjfNeE25MYqviPcvSokwpxRyrrhYaGCf6"
);
const RPC_URL = "https://api.devnet.solana.com";

async function testWorkingLoan() {
  console.log("🎯 FINAL TEST - Working with Original Program ID");
  console.log("Program ID:", PROGRAM_ID.toString());
  console.log("=".repeat(60));

  try {
    const connection = new Connection(RPC_URL, "confirmed");

    // Load wallet
    const secret = JSON.parse(
      fs.readFileSync(process.env.HOME + "/.config/solana/id.json")
    );
    const wallet_keypair = Keypair.fromSecretKey(Uint8Array.from(secret));
    const wallet = new Wallet(wallet_keypair);

    console.log("✅ Wallet:", wallet_keypair.publicKey.toString());

    const balance = await connection.getBalance(wallet_keypair.publicKey);
    console.log("💰 Balance:", (balance / 1e9).toFixed(2), "SOL");

    // Setup program with our simplified IDL
    const idl = JSON.parse(
      fs.readFileSync("frontend/src/lib/idl.json", "utf8")
    );
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = new Program(idl, PROGRAM_ID, provider);

    console.log("✅ Program loaded");
    console.log("Available methods:", Object.keys(program.methods));

    // Test 1: Check if protocol exists
    const [protocolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol")],
      PROGRAM_ID
    );

    console.log("\n📋 Protocol PDA:", protocolPda.toString());

    let protocolExists = false;
    try {
      const protocolAccount = await program.account.protocol.fetch(protocolPda);
      console.log("✅ Protocol exists:", {
        authority: protocolAccount.authority.toString(),
        treasury: protocolAccount.treasury.toString(),
        feeRate: protocolAccount.feeRate,
        totalLoans: protocolAccount.totalLoans.toString(),
      });
      protocolExists = true;
    } catch (error) {
      console.log("❌ Protocol doesn't exist, will initialize");
    }

    // Test 2: Initialize protocol if needed
    if (!protocolExists) {
      console.log("\n🚀 Initializing protocol...");
      try {
        const tx = await program.methods
          .initialize()
          .accounts({
            protocol: protocolPda,
            authority: wallet_keypair.publicKey,
            treasury: wallet_keypair.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log("✅ Protocol initialized!");
        console.log("Transaction:", tx);
        console.log(
          `Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`
        );
      } catch (initError) {
        console.log("❌ Protocol initialization failed:", initError.message);
        if (initError.logs) {
          console.log("Program logs:");
          initError.logs.forEach((log) => console.log("  ", log));
        }
        return;
      }
    }

    // Test 3: Create a simple loan (without complex NFT setup)
    console.log("\n🏦 Creating test loan...");

    // Use a dummy mint for testing
    const dummyMint = Keypair.generate();

    const [loanPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("loan"),
        wallet_keypair.publicKey.toBuffer(),
        dummyMint.publicKey.toBuffer(),
      ],
      PROGRAM_ID
    );

    console.log("Loan PDA:", loanPda.toString());

    const loanAmount = new BN(1000000000); // 1 SOL
    const duration = new BN(30 * 24 * 60 * 60); // 30 days
    const interestRate = 1000; // 10% (keep as number)

    try {
      const tx = await program.methods
        .createLoan(loanAmount, duration, interestRate)
        .accounts({
          borrower: wallet_keypair.publicKey,
          lender: wallet_keypair.publicKey, // Same for testing
          protocol: protocolPda,
          collateralMint: dummyMint.publicKey,
          loan: loanPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("🎉 LOAN CREATED SUCCESSFULLY!");
      console.log("Transaction:", tx);
      console.log(
        `Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`
      );

      // Fetch the loan data
      const loanAccount = await program.account.loan.fetch(loanPda);
      console.log("\n📊 Loan Details:");
      console.log("- Borrower:", loanAccount.borrower.toString());
      console.log("- Lender:", loanAccount.lender.toString());
      console.log("- Amount:", loanAccount.loanAmount / 1e9, "SOL");
      console.log("- Interest Rate:", loanAccount.interestRate / 100, "%");
      console.log("- Duration:", loanAccount.duration / (24 * 60 * 60), "days");
      console.log("- Status:", Object.keys(loanAccount.status)[0]);

      console.log("\n🎯 SUCCESS! DAY 1 TASK 1.1 COMPLETED!");
      console.log("✅ Protocol account working");
      console.log("✅ Loan creation working");
      console.log("✅ Ready to move to frontend integration");
    } catch (loanError) {
      console.log("❌ Loan creation failed:", loanError.message);
      if (loanError.logs) {
        console.log("Program logs:");
        loanError.logs.forEach((log) => console.log("  ", log));
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testWorkingLoan().catch(console.error);
