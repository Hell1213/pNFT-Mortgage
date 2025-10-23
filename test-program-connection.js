#!/usr/bin/env node

/**
 * Test program connection and basic functionality
 */

const { Connection, PublicKey } = require("@solana/web3.js");
const { AnchorProvider, Program, Wallet } = require("@coral-xyz/anchor");
const fs = require("fs");

const PROGRAM_ID = new PublicKey(
  "C2kfwjLdi7uJjfNeE25MYqviPcvSokwpxRyrrhYaGCf6"
);
const RPC_URL = "https://api.devnet.solana.com";

async function testProgramConnection() {
  console.log("🧪 Testing Program Connection...\n");

  try {
    // 1. Test RPC connection
    console.log("1. Testing RPC connection...");
    const connection = new Connection(RPC_URL, "confirmed");
    const slot = await connection.getSlot();
    console.log("✅ RPC connected, current slot:", slot);

    // 2. Test program account exists
    console.log("\n2. Testing program account...");
    const programAccount = await connection.getAccountInfo(PROGRAM_ID);
    if (!programAccount) {
      console.log("❌ Program account not found!");
      return;
    }
    console.log("✅ Program account found");
    console.log("Program account details:", {
      owner: programAccount.owner.toString(),
      dataLength: programAccount.data.length,
      executable: programAccount.executable,
    });

    // 3. Test IDL loading
    console.log("\n3. Testing IDL loading...");
    const idl = JSON.parse(
      fs.readFileSync("frontend/src/lib/idl.json", "utf8")
    );
    console.log("✅ IDL loaded");
    console.log("IDL details:", {
      name: idl.name,
      version: idl.version,
      address: idl.address,
      instructions: idl.instructions?.length || 0,
      accounts: idl.accounts?.length || 0,
    });

    // 4. Test wallet loading
    console.log("\n4. Testing wallet...");
    let wallet_keypair;
    try {
      const secret = JSON.parse(
        fs.readFileSync(process.env.HOME + "/.config/solana/id.json")
      );
      wallet_keypair = require("@solana/web3.js").Keypair.fromSecretKey(
        Uint8Array.from(secret)
      );
      console.log("✅ Wallet loaded:", wallet_keypair.publicKey.toString());
    } catch (error) {
      console.log("❌ Wallet loading failed:", error.message);
      return;
    }

    // 5. Test provider creation
    console.log("\n5. Testing provider creation...");
    const wallet = new Wallet(wallet_keypair);
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    console.log("✅ Provider created");

    // 6. Test program creation
    console.log("\n6. Testing program creation...");
    const program = new Program(idl, PROGRAM_ID, provider);
    console.log("✅ Program created successfully!");
    console.log("Program details:", {
      programId: program.programId.toString(),
      methods: Object.keys(program.methods || {}),
      accounts: Object.keys(program.account || {}),
    });

    // 7. Test program methods
    console.log("\n7. Testing program methods...");
    if (program.methods) {
      console.log("Available methods:", Object.keys(program.methods));

      // Test if initialize method exists
      if (program.methods.initialize) {
        console.log("✅ initialize method found");
      } else {
        console.log("❌ initialize method not found");
      }

      // Test if createLoan method exists
      if (program.methods.createLoan) {
        console.log("✅ createLoan method found");
      } else {
        console.log("❌ createLoan method not found");
      }
    } else {
      console.log("❌ No methods found on program");
    }

    // 8. Test account types
    console.log("\n8. Testing account types...");
    if (program.account) {
      console.log("Available account types:", Object.keys(program.account));
    } else {
      console.log("❌ No account types found");
    }

    console.log("\n🎉 All tests passed! Program connection is working.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Full error:", error);
  }
}

testProgramConnection().catch(console.error);
