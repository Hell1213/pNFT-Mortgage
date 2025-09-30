'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

export const useUnifiedWallet = () => {
  const walletAdapter = useWallet();
  const [directConnection, setDirectConnection] = useState<{
    connected: boolean;
    publicKey: string | null;
    wallet: string | null;
  }>({
    connected: false,
    publicKey: null,
    wallet: null,
  });
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check direct browser wallet connection
  useEffect(() => {
    if (!mounted) return;

    const checkDirectConnection = () => {
      if (typeof window !== 'undefined') {
        if (window.solana?.isPhantom && window.solana.isConnected) {
          setDirectConnection({
            connected: true,
            publicKey: window.solana.publicKey?.toString() || null,
            wallet: 'Phantom',
          });
        } else if (window.solflare?.isSolflare && window.solflare.isConnected) {
          setDirectConnection({
            connected: true,
            publicKey: window.solflare.publicKey?.toString() || null,
            wallet: 'Solflare',
          });
        } else {
          setDirectConnection({
            connected: false,
            publicKey: null,
            wallet: null,
          });
        }
      }
    };

    checkDirectConnection();

    // Listen for wallet events
    const handlePhantomConnect = () => {
      if (typeof window !== 'undefined' && window.solana) {
        setDirectConnection({
          connected: true,
          publicKey: window.solana.publicKey?.toString() || null,
          wallet: 'Phantom',
        });
      }
    };

    const handleSolflareConnect = () => {
      if (typeof window !== 'undefined' && window.solflare) {
        setDirectConnection({
          connected: true,
          publicKey: window.solflare.publicKey?.toString() || null,
          wallet: 'Solflare',
        });
      }
    };

    const handleDisconnect = () => {
      setDirectConnection({
        connected: false,
        publicKey: null,
        wallet: null,
      });
    };

    if (typeof window !== 'undefined') {
      if (window.solana) {
        window.solana.on('connect', handlePhantomConnect);
        window.solana.on('disconnect', handleDisconnect);
      }

      if (window.solflare) {
        window.solflare.on('connect', handleSolflareConnect);
        window.solflare.on('disconnect', handleDisconnect);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        if (window.solana) {
          window.solana.removeListener('connect', handlePhantomConnect);
          window.solana.removeListener('disconnect', handleDisconnect);
        }
        if (window.solflare) {
          window.solflare.removeListener('connect', handleSolflareConnect);
          window.solflare.removeListener('disconnect', handleDisconnect);
        }
      }
    };
  }, [mounted]);

  // Determine which connection to use - prioritize React wallet adapter
  const isConnected = walletAdapter.connected || directConnection.connected;
  const publicKey = walletAdapter.publicKey?.toString() || directConnection.publicKey;
  const walletName = walletAdapter.wallet?.adapter.name || directConnection.wallet;

  // Debug logging
  useEffect(() => {
    if (!mounted) return;
    
    console.log('=== UNIFIED WALLET DEBUG ===');
    console.log('Wallet Adapter:', {
      connected: walletAdapter.connected,
      publicKey: walletAdapter.publicKey?.toString(),
      wallet: walletAdapter.wallet?.adapter.name,
    });
    console.log('Direct Connection:', directConnection);
    console.log('Final State:', {
      isConnected,
      publicKey,
      walletName,
    });
  }, [walletAdapter, directConnection, isConnected, publicKey, walletName, mounted]);

  return {
    // Unified state
    connected: isConnected,
    publicKey,
    wallet: walletName,
    
    // Individual states for debugging
    walletAdapter,
    directConnection,
    
    // Functions
    connect: walletAdapter.connect,
    disconnect: walletAdapter.disconnect,
    signTransaction: walletAdapter.signTransaction,
    signAllTransactions: walletAdapter.signAllTransactions,
  };
};
