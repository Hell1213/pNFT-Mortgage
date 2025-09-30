import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import idlJson from './idl.json';

const PROGRAM_ID = new PublicKey('C2kfwjLdi7uJjfNeE25MYqviPcvSokwpxRyrrhYaGCf6');

export const getConnection = (): Connection => {
  return new Connection('https://api.devnet.solana.com', 'confirmed');
};

export const getProgram = (provider: AnchorProvider): Program => {
  console.log('Creating program with IDL:', {
    name: idlJson.name,
    version: idlJson.version,
    instructions: idlJson.instructions?.length,
    address: PROGRAM_ID.toString()
  });
  console.log('Provider details:', {
    connection: provider.connection.rpcEndpoint,
    wallet: provider.wallet.publicKey?.toString()
  });

  try {
    // ✅ CORRECT: Use the proper Program constructor (Idl, provider)
    const idl: Idl = idlJson as unknown as Idl;
    const program = new Program(idl, provider);
    console.log('✅ Program created:', program.programId.toString());
    return program;
  } catch (error) {
    console.error('Error creating program:', error);
    throw error;
  }
};

// PDA helpers
export const getProtocolPDA = (): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('protocol')],
    PROGRAM_ID
  );
};

export const getLoanPDA = (borrower: PublicKey, loanIndex: number): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('loan'), borrower.toBuffer(), Buffer.from(loanIndex.toString())],
    PROGRAM_ID
  );
};

export const getVaultPDA = (mint: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), mint.toBuffer()],
    PROGRAM_ID
  );
};

export const getAuctionPDA = (loan: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('auction'), loan.toBuffer()],
    PROGRAM_ID
  );
};
