#!/usr/bin/env node

const {
  Connection,
  PublicKey,
  SystemProgram,
  Keypair,
} = require("@solana/web3.js");
const { AnchorProvider, Program, Wallet } = require("@coral-xyz/anchor");
const fs = require("fs");

const PROGRAM_ID = new PublicKey(
  "8gjRfYcvuD7iUKSVjMQDsxyPgm25vf14dWYh4thbCyRN"
);
const RPC_URL = "https://api.devnet.solana.com";

async function testSimpleLoan() {
  console.log("🧪 Simple Loan Test...\n");

  try {
    const connection = new Connection(RPC_URL, "confirmed");

    // Load wallet
    const secret = JSON.parse(
      fs.readFileSync(process.env.HOME + "/.config/solana/id.json")
    );
    const wallet_keypair = Keypair.fromSecretKey(Uint8Array.from(secret));
    const wallet = new Wallet(wallet_keypair);

    console.log("✅ Wallet loaded:", wallet_keypair.publicKey.toString());

    // Setup program
    const idl = JSON.parse(
      fs.readFileSync("frontend/src/lib/idl.json", "utf8")
    );
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = new Program(idl, PROGRAM_ID, provider);

    console.log("✅ Program loaded");
    console.log("Available methods:", Object.keys(program.methods));

    // Test protocol initialization first
    const [protocolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol")],
      PROGRAM_ID
    );

    console.log("Protocol PDA:", protocolPda.toString());

    // Check if protocol exists
    try {
      const protocolAccount = await program.account.protocol.fetch(protocolPda);
      console.log("✅ Protocol already exists");
    } catch (error) {
      console.log("❌ Protocol doesn't exist, initializing...");

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

        console.log("✅ Protocol initialized:", tx);
      } catch (initError) {
        console.error("❌ Protocol initialization failed:", initError.message);
        return;
      }
    }

    console.log("\n✅ Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.logs) {
      console.log("\nProgram logs:");
      error.logs.forEach((log) => console.log("  ", log));
    }
  }
}

testSimpleLoan().catch(console.error);
