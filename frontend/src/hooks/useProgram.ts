import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('C2kfwjLdi7uJjfNeE25MYqviPcvSokwpxRyrrhYaGCf6');

// Import IDL using require to avoid TypeScript issues
const idlJson = require('@/lib/idl.json');

export const useProgram = () => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [provider, setProvider] = useState<AnchorProvider | null>(null);
  const [program, setProgram] = useState<Program | null>(null);

  console.log('useProgram - Wallet state:', {
    publicKey: publicKey?.toString(),
    hasSignTransaction: !!signTransaction,
    hasSignAllTransactions: !!signAllTransactions,
    hasConnection: !!connection,
    connectionEndpoint: connection?.rpcEndpoint
  });

  // Create provider when wallet connects
  useEffect(() => {
    console.log('=== PROVIDER useEffect RUNNING ===');
    console.log('Dependencies check:', {
      publicKey: !!publicKey,
      signTransaction: !!signTransaction,
      signAllTransactions: !!signAllTransactions,
      connection: !!connection
    });

    if (!publicKey || !signTransaction || !signAllTransactions || !connection) {
      console.log('Missing wallet data, clearing provider');
      setProvider(null);
      setProgram(null);
      return;
    }

    console.log('Creating new AnchorProvider...');
    const wallet = {
      publicKey,
      signTransaction,
      signAllTransactions,
    };

    try {
      const newProvider = new AnchorProvider(connection, wallet as any, {
        preflightCommitment: 'processed',
      });
      console.log('✅ AnchorProvider created successfully');
      console.log('Provider details:', {
        connection: newProvider.connection.rpcEndpoint,
        wallet: newProvider.wallet.publicKey?.toString()
      });
      setProvider(newProvider);
    } catch (error) {
      console.error('❌ Error creating provider:', error);
      setProvider(null);
    }
  }, [publicKey, signTransaction, signAllTransactions, connection]);

  // Create program when provider is available
  useEffect(() => {
    console.log('=== PROGRAM useEffect RUNNING ===');
    console.log('Provider available:', !!provider);

    if (!provider) {
      console.log('No provider, clearing program');
      setProgram(null);
      return;
    }

    console.log('Creating program with provider...');
    console.log('IDL structure:', {
      name: idlJson.name,
      version: idlJson.version,
      instructions: idlJson.instructions?.length,
      accounts: idlJson.accounts?.length
    });
    
    try {
      // ✅ CORRECT: Use Program constructor (Idl, provider) - PROGRAM_ID is embedded in IDL
      const newProgram = new Program(idlJson as unknown as Idl, provider);
      console.log('✅ Program created successfully!');
      console.log('Program details:', {
        programId: newProgram.programId.toString(),
        expectedProgramId: PROGRAM_ID.toString(),
        match: newProgram.programId.equals(PROGRAM_ID)
      });
      setProgram(newProgram);
    } catch (error) {
      console.error('❌ Error creating program:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setProgram(null);
    }
  }, [provider]);

  console.log('useProgram - Final state:', {
    provider: !!provider,
    program: !!program,
    publicKey: !!publicKey
  });

  return {
    program,
    publicKey,
    provider,
    connection
  };
};
