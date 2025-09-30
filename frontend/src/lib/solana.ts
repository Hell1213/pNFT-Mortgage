import { Connection, PublicKey } from '@solana/web3.js';
import { CONFIG } from './config';

// Create connection instance
export const getConnection = (): Connection => {
  return new Connection(
    CONFIG.SOLANA_RPC_URL,
    'confirmed'
  );
};

// Helper function to create PublicKey safely
export const createPublicKey = (key: string): PublicKey => {
  try {
    return new PublicKey(key);
  } catch (error) {
    throw new Error(`Invalid public key: ${key}`);
  }
};

// Helper function to format SOL amounts
export const formatSOL = (lamports: number): string => {
  return (lamports / 1e9).toFixed(4);
};

// Helper function to parse SOL amounts
export const parseSOL = (sol: string): number => {
  return parseFloat(sol) * 1e9;
};

// Helper function to get account info
export const getAccountInfo = async (publicKey: PublicKey) => {
  try {
    const connection = getConnection();
    return await connection.getAccountInfo(publicKey);
  } catch (error) {
    console.error('Error fetching account info:', error);
    return null;
  }
};

// Helper function to get balance
export const getBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    const connection = getConnection();
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
};
