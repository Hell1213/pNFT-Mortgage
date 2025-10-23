#!/usr/bin/env node

const {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} = require("@solana/web3.js");
const fs = require("fs");

const PROGRAM_ID = new PublicKey(
  "C2kfwjLdi7uJjfNeE25MYqviPcvSokwpxRyrrhYaGCf6"
);
const RPC_URL = "https://api.devnet.solana.com";

async function clearProtocolAccount() {
  console.log("🧹 Clearing Protocol Account...\n");

  try {
    const connection = new Connection(RPC_URL, "confirmed");

    // Load wallet
    const secret = JSON.parse(
      fs.readFileSync(process.env.HOME + "/.config/solana/id.json")
    );
    const wallet_keypair = require("@solana/web3.js").Keypair.fromSecretKey(
      Uint8Array.from(secret)
    );

    // Get protocol PDA
    const [protocolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol")],
      PROGRAM_ID
    );

    console.log("Protocol PDA:", protocolPda.toString());
    console.log("Wallet:", wallet_keypair.publicKey.toString());

    // Check account info
    const accountInfo = await connection.getAccountInfo(protocolPda);

    if (!accountInfo) {
      console.log("✅ Protocol account does not exist - nothing to clear");
      return;
    }

    console.log("Account details:", {
      owner: accountInfo.owner.toString(),
      dataLength: accountInfo.data.length,
      executable: accountInfo.executable,
      lamports: accountInfo.lamports,
    });

    // If owned by System Program, we can close it by transferring lamports
    if (
      accountInfo.owner.equals(
        new PublicKey("11111111111111111111111111111111")
      )
    ) {
      console.log(
        "🔄 Account is owned by System Program, attempting to close..."
      );

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: protocolPda,
          toPubkey: wallet_keypair.publicKey,
          lamports: accountInfo.lamports,
        })
      );

      try {
        const signature = await connection.sendTransaction(transaction, [
          wallet_keypair,
        ]);
        await connection.confirmTransaction(signature);
        console.log("✅ Account closed successfully:", signature);
      } catch (error) {
        console.log("❌ Failed to close account:", error.message);
        console.log("This is expected if the account has data or is a PDA");
      }
    } else {
      console.log(
        "ℹ️ Account is owned by program:",
        accountInfo.owner.toString()
      );
      console.log("Cannot close program-owned accounts directly");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

clearProtocolAccount().catch(console.error);
