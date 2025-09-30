import { useState, useCallback, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { PNFTManager, PNFTMetadata, CollateralData, createPNFTManager } from '@/lib/pnft-manager';

export const usePNFT = () => {
  const { publicKey, connected, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [pnftManager, setPnftManager] = useState<PNFTManager | null>(null);
  const [ownedNFTs, setOwnedNFTs] = useState<CollateralData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize pNFT manager when wallet connects
  useEffect(() => {
    if (connected && publicKey && connection && signTransaction && signAllTransactions) {
      try {
        // Create proper wallet adapter object
        const walletAdapter = {
          publicKey,
          signTransaction,
          signAllTransactions,
          connected: true,
          connecting: false,
          disconnect: async () => {},
          connect: async () => {},
        };
        
        const manager = createPNFTManager(connection, walletAdapter as any);
        setPnftManager(manager);
        console.log('pNFT Manager initialized successfully');
      } catch (err) {
        console.error('Error initializing pNFT manager:', err);
        setError('Failed to initialize pNFT manager');
      }
    } else {
      setPnftManager(null);
      setOwnedNFTs([]);
      console.log('pNFT Manager not initialized - missing wallet data:', {
        connected,
        publicKey: !!publicKey,
        connection: !!connection,
        signTransaction: !!signTransaction,
        signAllTransactions: !!signAllTransactions
      });
    }
  }, [connected, publicKey, connection, signTransaction, signAllTransactions]);

  // Fetch owned NFTs when manager is available
  useEffect(() => {
    if (pnftManager && publicKey) {
      fetchOwnedNFTs();
    }
  }, [pnftManager, publicKey]);

  const fetchOwnedNFTs = useCallback(async () => {
    if (!pnftManager || !publicKey) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching owned NFTs...');
      const nfts = await pnftManager.getOwnedNFTs(publicKey);
      console.log(`Found ${nfts.length} owned NFTs`);
      setOwnedNFTs(nfts);
    } catch (err) {
      console.error('Error fetching owned NFTs:', err);
      setError('Failed to fetch owned NFTs');
    } finally {
      setLoading(false);
    }
  }, [pnftManager, publicKey]);

  const createPNFT = useCallback(async (metadata: PNFTMetadata, estimatedValue: number) => {
    if (!pnftManager || !publicKey) {
      throw new Error('pNFT manager not available or wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating pNFT with wallet:', publicKey.toString());
      const result = await pnftManager.createCollateralPNFT(metadata, estimatedValue);
      console.log('pNFT created successfully:', result.mint.toString());
      
      // Refresh owned NFTs after creation
      setTimeout(() => {
        fetchOwnedNFTs();
      }, 2000);
      
      return result;
    } catch (err) {
      console.error('Error creating pNFT:', err);
      setError(err instanceof Error ? err.message : 'Failed to create pNFT');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pnftManager, publicKey, fetchOwnedNFTs]);

  const getEligibleCollateralNFTs = useCallback(() => {
    return ownedNFTs.filter(nft => nft.isProgrammable && nft.canBeUsedAsCollateral);
  }, [ownedNFTs]);

  return {
    pnftManager,
    ownedNFTs,
    loading,
    error,
    isConnected: connected && !!publicKey,
    createPNFT,
    fetchOwnedNFTs,
    getEligibleCollateralNFTs,
  };
};
