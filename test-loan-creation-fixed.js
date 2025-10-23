#!/usr/bin/env node

const {
  Connection,
  PublicKey,
  SystemProgram,
  Keypair,
} = require("@solana/web3.js");
const { AnchorProvider, Program, Wallet } = require("@coral-xyz/anchor");
const {
  createMint,
  createAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
} = require("@solana/spl-token");
const fs = require("fs");

const PROGRAM_ID = new PublicKey(
  "8gjRfYcvuD7iUKSVjMQDsxyPgm25vf14dWYh4thbCyRN"
);
const RPC_URL = "https://api.devnet.solana.com";

async function testLoanCreation() {
  console.log("🧪 Testing Loan Creation (Fixed Version)...\n");

  try {
    const connection = new Connection(RPC_URL, "confirmed");

    // 1. Load wallet
    const secret = JSON.parse(
      fs.readFileSync(process.env.HOME + "/.config/solana/id.json")
    );
    const wallet_keypair = Keypair.fromSecretKey(Uint8Array.from(secret));
    const wallet = new Wallet(wallet_keypair);

    console.log("✅ Wallet loaded:", wallet_keypair.publicKey.toString());

    // 2. Setup program
    const idl = JSON.parse(
      fs.readFileSync("frontend/src/lib/idl.json", "utf8")
    );
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = new Program(idl, PROGRAM_ID, provider);

    console.log("✅ Program loaded");

    // 3. Create a real NFT mint (supply = 1)
    console.log("\n📦 Creating NFT mint...");

    const nftMint = await createMint(
      connection,
      wallet_keypair,
      wallet_keypair.publicKey, // mint authority
      wallet_keypair.publicKey, // freeze authority
      0 // decimals = 0 for NFT
    );

    console.log("✅ NFT mint created:", nftMint.toString());

    // 4. Create associated token account for the NFT
    const nftTokenAccount = await createAssociatedTokenAccount(
      connection,
      wallet_keypair,
      nftMint,
      wallet_keypair.publicKey
    );

    console.log("✅ NFT token account created:", nftTokenAccount.toString());

    // 5. Mint 1 NFT to the token account
    await mintTo(
      connection,
      wallet_keypair,
      nftMint,
      nftTokenAccount,
      wallet_keypair.publicKey,
      1 // mint 1 NFT
    );

    console.log("✅ NFT minted to token account");

    // 6. Generate loan PDA
    const [loanPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("loan"),
        wallet_keypair.publicKey.toBuffer(),
        nftMint.toBuffer(),
      ],
      PROGRAM_ID
    );

    console.log("✅ Loan PDA generated:", loanPda.toString());

    // 7. Create loan
    console.log("\n🚀 Creating loan...");

    const loanAmount = 1000000000; // 1 SOL (as number)
    const duration = 30 * 24 * 60 * 60; // 30 days (as number)
    const interestRate = 1000; // 10%

    console.log("Loan parameters:", {
      amount: loanAmount / 1e9 + " SOL",
      duration: duration / (24 * 60 * 60) + " days",
      interestRate: interestRate / 100 + "%",
    });

    // For testing, use same wallet as both borrower and lender
    const lenderKeypair = wallet_keypair;

    const tx = await program.methods
      .createLoan(loanAmount, duration, interestRate)
      .accounts({
        borrower: wallet_keypair.publicKey,
        lender: lenderKeypair.publicKey,
        collateralMint: nftMint,
        collateralToken: nftTokenAccount,
        loan: loanPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([wallet_keypair])
      .rpc();

    console.log("🎉 Loan created successfully!");
    console.log("Transaction:", tx);
    console.log(
      `Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`
    );

    // 8. Fetch and display loan data
    console.log("\n📊 Fetching loan data...");

    const loanAccount = await program.account.loan.fetch(loanPda);
    console.log("Loan details:", {
      borrower: loanAccount.borrower.toString(),
      lender: loanAccount.lender.toString(),
      collateralMint: loanAccount.collateralMint.toString(),
      loanAmount: loanAccount.loanAmount.toNumber() / 1e9 + " SOL",
      outstandingAmount:
        loanAccount.outstandingAmount.toNumber() / 1e9 + " SOL",
      interestRate: loanAccount.interestRate / 100 + "%",
      duration: loanAccount.duration.toNumber() / (24 * 60 * 60) + " days",
      status: Object.keys(loanAccount.status)[0],
      liquidationThreshold: loanAccount.liquidationThreshold / 100 + "%",
    });

    console.log("\n✅ Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.logs) {
      console.log("\nProgram logs:");
      error.logs.forEach((log) => console.log("  ", log));
    }
  }
}

testLoanCreation().catch(console.error);
