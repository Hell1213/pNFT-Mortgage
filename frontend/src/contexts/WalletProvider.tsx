'use client';

import React, { createContext, useContext, useMemo, ReactNode, useEffect } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { CONFIG } from '@/lib/config';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextType {
  network: WalletAdapterNetwork;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  // Configure wallets with proper settings
  const wallets = useMemo(
    () => {
      console.log('Initializing wallets...');
      const walletList = [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
      ];
      console.log('Wallets initialized:', walletList.map(w => w.name));
      return walletList;
    },
    []
  );

  // Configure network
  const network = WalletAdapterNetwork.Devnet;

  const contextValue = useMemo(
    () => ({
      network,
    }),
    [network]
  );

  // Debug wallet connection
  useEffect(() => {
    console.log('WalletProvider mounted');
    console.log('Available wallets:', wallets.map(w => w.name));
    console.log('RPC URL:', CONFIG.SOLANA_RPC_URL);
    
    // Check if any wallet is already connected
    const checkExistingConnection = () => {
      if (window.solana?.isPhantom && window.solana.isConnected) {
        console.log('Phantom already connected:', window.solana.publicKey?.toString());
      }
      if (window.solflare?.isSolflare && window.solflare.isConnected) {
        console.log('Solflare already connected:', window.solflare.publicKey?.toString());
      }
    };
    
    checkExistingConnection();
  }, [wallets]);

  return (
    <ConnectionProvider endpoint={CONFIG.SOLANA_RPC_URL}>
      <SolanaWalletProvider 
        wallets={wallets} 
        autoConnect={true}
        onError={(error) => {
          console.error('Wallet error:', error);
        }}
      >
        <WalletModalProvider>
          <WalletContext.Provider value={contextValue}>
            {children}
          </WalletContext.Provider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
