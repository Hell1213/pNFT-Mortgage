#!/usr/bin/env node

const { Connection, PublicKey } = require("@solana/web3.js");

const PROGRAM_ID = new PublicKey(
  "C2kfwjLdi7uJjfNeE25MYqviPcvSokwpxRyrrhYaGCf6"
);
const RPC_URL = "https://api.devnet.solana.com";

async function debugProtocolAccounts() {
  console.log("🔍 Debugging Protocol Accounts...\n");

  const connection = new Connection(RPC_URL, "confirmed");

  // Try different possible seeds for protocol PDA
  const possibleSeeds = [
    [Buffer.from("protocol")],
    [Buffer.from("global")],
    [Buffer.from("state")],
    [Buffer.from("globalState")],
    [Buffer.from("protocol_state")],
  ];

  for (let i = 0; i < possibleSeeds.length; i++) {
    const seeds = possibleSeeds[i];
    const seedStr = seeds.map((s) => s.toString()).join(", ");

    try {
      const [pda] = PublicKey.findProgramAddressSync(seeds, PROGRAM_ID);
      console.log(`Seeds [${seedStr}]: ${pda.toString()}`);

      const accountInfo = await connection.getAccountInfo(pda);
      if (accountInfo) {
        console.log(`  ✅ Account exists!`);
        console.log(`  Owner: ${accountInfo.owner.toString()}`);
        console.log(`  Data length: ${accountInfo.data.length}`);
        console.log(`  Lamports: ${accountInfo.lamports}`);

        if (accountInfo.owner.equals(PROGRAM_ID)) {
          console.log(`  🎯 This account is owned by our program!`);
        }
      } else {
        console.log(`  ❌ Account doesn't exist`);
      }
      console.log();
    } catch (error) {
      console.log(`  ❌ Error with seeds [${seedStr}]: ${error.message}`);
    }
  }

  // Also check if there are any accounts owned by our program
  console.log("🔍 Searching for all accounts owned by our program...");
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID);
    console.log(`Found ${accounts.length} accounts owned by program:`);

    accounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.pubkey.toString()}`);
      console.log(`   Data length: ${account.account.data.length}`);
      console.log(`   Lamports: ${account.account.lamports}`);
    });
  } catch (error) {
    console.log("❌ Error fetching program accounts:", error.message);
  }
}

debugProtocolAccounts().catch(console.error);
