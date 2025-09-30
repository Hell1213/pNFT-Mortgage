import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { CONFIG } from './config';
import { getConnection } from './solana';

// Import the IDL type
export interface PnftMortgageMarketIdl extends Idl {
  address: string;
  metadata: {
    name: string;
    version: string;
    spec: string;
    description: string;
    repository: string;
    dependencies: any[];
    contact: any;
  };
  instructions: any[];
  accounts: any[];
  types: any[];
  events: any[];
  errors: any[];
}

// Create connection instance
const connection = getConnection();

// Program ID from deployed contract
const PROGRAM_ID = new PublicKey(CONFIG.PROGRAM_ID);

// Create the program instance
export const createProgram = (provider: AnchorProvider): Program<PnftMortgageMarketIdl> => {
  return new Program<PnftMortgageMarketIdl>(IDL as PnftMortgageMarketIdl, provider);
};

// Get the program ID
export const getProgramId = (): PublicKey => {
  return PROGRAM_ID;
};

// Get the connection
export const getConnectionInstance = () => {
  return connection;
};

// Helper function to get protocol PDA
export const getProtocolPDA = (): PublicKey => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('protocol')],
    PROGRAM_ID
  );
  return pda;
};

// Helper function to get loan PDA
export const getLoanPDA = (borrower: PublicKey, loanIndex: number): PublicKey => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('loan'), borrower.toBuffer(), Buffer.from(loanIndex.toString())],
    PROGRAM_ID
  );
  return pda;
};

// Helper function to get vault PDA
export const getVaultPDA = (loan: PublicKey): PublicKey => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), loan.toBuffer()],
    PROGRAM_ID
  );
  return pda;
};

// Helper function to get auction PDA
export const getAuctionPDA = (loan: PublicKey): PublicKey => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('auction'), loan.toBuffer()],
    PROGRAM_ID
  );
  return pda;
};

// Mock IDL for now - replace with actual IDL when available
const IDL: PnftMortgageMarketIdl = {
  address: CONFIG.PROGRAM_ID,
  metadata: {
    name: 'pnft_mortgage_market',
    version: '0.1.0',
    spec: '0.1.0',
    description: 'pNFT Mortgage Market Program',
    repository: '',
    dependencies: [],
    contact: {}
  },
  instructions: [],
  accounts: [],
  types: [],
  events: [],
  errors: []
};
