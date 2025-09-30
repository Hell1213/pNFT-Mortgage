import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface WalletBalance {
  sol: number;
  lamports: number;
  isLoading: boolean;
  error: string | null;
}

export const useWalletBalance = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<WalletBalance>({
    sol: 0,
    lamports: 0,
    isLoading: false,
    error: null,
  });

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setBalance({
        sol: 0,
        lamports: 0,
        isLoading: false,
        error: null,
      });
      return;
    }

    setBalance(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const lamports = await connection.getBalance(publicKey);
      const sol = lamports / LAMPORTS_PER_SOL;

      setBalance({
        sol,
        lamports,
        isLoading: false,
        error: null,
      });

      console.log('Wallet balance:', { sol, lamports });
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balance',
      }));
    }
  }, [publicKey, connected, connection]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const hasMinimumBalance = (minimumSOL: number = 0.01) => {
    return balance.sol >= minimumSOL;
  };

  const getBalanceStatus = () => {
    if (balance.isLoading) return 'loading';
    if (balance.error) return 'error';
    if (balance.sol < 0.001) return 'insufficient';
    if (balance.sol < 0.01) return 'low';
    return 'sufficient';
  };

  return {
    ...balance,
    fetchBalance,
    hasMinimumBalance,
    getBalanceStatus,
  };
};
