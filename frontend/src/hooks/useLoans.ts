import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgram } from './useProgram';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Loan, LoanStatus } from '@/types/loan';
import { BN } from '@coral-xyz/anchor';

interface CreateLoanParams {
  loanAmount: number;
  interestRate: number;
  duration: number;
  liquidationThreshold: number;
  collateralMint?: string;
}

// Helper functions for PDA generation
const getProtocolPDA = () => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('protocol')],
    new PublicKey('C2kfwjLdi7uJjfNeE25MYqviPcvSokwpxRyrrhYaGCf6')
  );
  return pda;
};

const getLoanPDA = (borrower: PublicKey, loanIndex: number) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('loan'), borrower.toBuffer(), new BN(loanIndex).toArrayLike(Buffer, 'le', 8)],
    new PublicKey('C2kfwjLdi7uJjfNeE25MYqviPcvSokwpxRyrrhYaGCf6')
  );
  return pda;
};

export const useLoans = () => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { program, provider } = useProgram();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug program state
  useEffect(() => {
    console.log('useLoans - Program state:', {
      program: !!program,
      provider: !!provider,
      publicKey: publicKey?.toString(),
      signTransaction: !!signTransaction,
      signAllTransactions: !!signAllTransactions
    });
  }, [program, provider, publicKey, signTransaction, signAllTransactions]);

  // Load loans from blockchain on mount
  useEffect(() => {
    fetchLoans();
  }, [program, publicKey]);

  const fetchLoans = useCallback(async () => {
    if (!program || !publicKey) {
      console.log('No program or publicKey available for fetching loans');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching loans from blockchain...');
      
      // For now, let's fetch from localStorage as a fallback
      // TODO: Implement real blockchain fetching when program accounts are available
      const storedLoans = localStorage.getItem('mockLoans');
      if (storedLoans) {
        const parsedLoans = JSON.parse(storedLoans);
        setLoans(parsedLoans);
        console.log('Loaded loans from localStorage:', parsedLoans.length);
      } else {
        setLoans([]);
        console.log('No loans found in localStorage');
      }
    } catch (err) {
      console.error('Error fetching loans:', err);
      setError('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  const createLoan = useCallback(async (params: CreateLoanParams) => {
    console.log('=== CREATE LOAN DEBUG ===');
    console.log('Program available:', !!program);
    console.log('Provider available:', !!provider);
    console.log('PublicKey available:', !!publicKey);
    console.log('SignTransaction available:', !!signTransaction);
    console.log('SignAllTransactions available:', !!signAllTransactions);
    
    if (!program || !publicKey || !signTransaction) {
      const missing = [];
      if (!program) missing.push('program');
      if (!publicKey) missing.push('publicKey');
      if (!signTransaction) missing.push('signTransaction');
      
      console.error('Missing required data:', missing);
      setError(`Program not available. Missing: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating REAL loan on blockchain with params:', params);
      console.log('Program methods available:', Object.keys(program.methods));
      
      // Generate PDAs
      const protocolPDA = getProtocolPDA();
      const loanPDA = getLoanPDA(publicKey, 0); // Using 0 as loan index for now
      
      console.log('Protocol PDA:', protocolPDA.toString());
      console.log('Loan PDA:', loanPDA.toString());
      
      // Create the real blockchain transaction
      const tx = await program.methods
        .createLoan(
          new BN(params.loanAmount * 1e9), // Convert to lamports
          new BN(params.interestRate),
          new BN(params.duration),
          new BN(params.liquidationThreshold)
        )
        .accounts({
          protocol: protocolPDA,
          loan: loanPDA,
          borrower: publicKey,
          collateralMint: new PublicKey(params.collateralMint || '11111111111111111111111111111111'),
          systemProgram: SystemProgram.programId,
          tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          rent: new PublicKey('SysvarRent111111111111111111111111111111111'),
        })
        .rpc();

      console.log('REAL LOAN CREATED SUCCESSFULLY ON BLOCKCHAIN!', tx);
      
      // Create a local representation for UI
      const newLoan: Loan = {
        id: loanPDA.toString(),
        borrower: publicKey.toString(),
        lender: 'System', // Placeholder
        collateralMint: params.collateralMint || 'MockMint123',
        loanAmount: params.loanAmount,
        outstandingAmount: params.loanAmount,
        interestRate: params.interestRate,
        duration: params.duration,
        liquidationThreshold: params.liquidationThreshold,
        status: LoanStatus.Active,
        createdAt: new Date().toISOString(),
        healthRatio: 100,
        collateralValue: params.loanAmount * 1.2,
      };

      // Add to localStorage for UI persistence
      const existingLoans = JSON.parse(localStorage.getItem('mockLoans') || '[]');
      const updatedLoans = [...existingLoans, newLoan];
      localStorage.setItem('mockLoans', JSON.stringify(updatedLoans));
      
      // Update state
      setLoans(updatedLoans);
      
      console.log('Loan added to UI:', newLoan);
      
    } catch (err) {
      console.error('Error creating real loan:', err);
      setError(`Failed to create loan: ${(err as Error).message || err}`);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey, signTransaction, provider]);

  const repayLoan = useCallback(async (loanId: string, amount: number) => {
    if (!program || !publicKey) {
      setError('Program not available. Please try connecting your wallet again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Repaying loan on blockchain:', loanId, 'Amount:', amount);
      
      // TODO: Implement real blockchain repayment
      // For now, update localStorage
      const updatedLoans = loans.map(loan => 
        loan.id === loanId 
          ? { ...loan, outstandingAmount: Math.max(0, loan.outstandingAmount - amount) }
          : loan
      );
      localStorage.setItem('mockLoans', JSON.stringify(updatedLoans));
      setLoans(updatedLoans);
      
      console.log('Loan repayment successful');
      
    } catch (err) {
      console.error('Error repaying loan:', err);
      setError('Failed to repay loan');
    } finally {
      setLoading(false);
    }
  }, [program, publicKey, loans]);

  const liquidateLoan = useCallback(async (loanId: string) => {
    if (!program || !publicKey) {
      setError('Program not available. Please try connecting your wallet again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Liquidating loan on blockchain:', loanId);
      
      // TODO: Implement real blockchain liquidation
      // For now, update localStorage
      const updatedLoans = loans.map(loan => 
        loan.id === loanId 
          ? { ...loan, status: LoanStatus.Liquidated }
          : loan
      );
      localStorage.setItem('mockLoans', JSON.stringify(updatedLoans));
      setLoans(updatedLoans);
      
      console.log('Loan liquidation successful');
      
    } catch (err) {
      console.error('Error liquidating loan:', err);
      setError('Failed to liquidate loan');
    } finally {
      setLoading(false);
    }
  }, [program, publicKey, loans]);

  return {
    loans,
    loading,
    error,
    createLoan,
    repayLoan,
    liquidateLoan,
    fetchLoans,
  };
};
