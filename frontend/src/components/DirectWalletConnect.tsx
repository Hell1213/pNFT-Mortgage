'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export const DirectWalletConnect: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phantomAvailable, setPhantomAvailable] = useState(false);
  const [solflareAvailable, setSolflareAvailable] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check wallet availability and initial connection status
  useEffect(() => {
    if (!mounted) return;

    const checkWallets = () => {
      if (typeof window !== 'undefined') {
        // Check Phantom
        const phantom = window.solana?.isPhantom;
        setPhantomAvailable(!!phantom);
        
        // Check Solflare
        const solflare = window.solflare?.isSolflare;
        setSolflareAvailable(!!solflare);

        console.log('Wallet availability check:', {
          phantom: !!phantom,
          solflare: !!solflare,
          phantomConnected: window.solana?.isConnected,
          solflareConnected: window.solflare?.isConnected
        });

        // Check if already connected
        if (phantom && window.solana?.isConnected) {
          setConnected(true);
          setPublicKey(window.solana.publicKey?.toString() || null);
          setWalletName('Phantom');
          console.log('Phantom already connected:', window.solana.publicKey?.toString());
        } else if (solflare && window.solflare?.isConnected) {
          setConnected(true);
          setPublicKey(window.solflare.publicKey?.toString() || null);
          setWalletName('Solflare');
          console.log('Solflare already connected:', window.solflare.publicKey?.toString());
        } else {
          setConnected(false);
          setPublicKey(null);
          setWalletName(null);
        }
      }
    };

    checkWallets();

    // Listen for wallet events
    const handlePhantomConnect = () => {
      if (typeof window !== 'undefined' && window.solana) {
        setConnected(true);
        setPublicKey(window.solana.publicKey?.toString() || null);
        setWalletName('Phantom');
        console.log('Phantom connected via event listener');
      }
    };

    const handleSolflareConnect = () => {
      if (typeof window !== 'undefined' && window.solflare) {
        setConnected(true);
        setPublicKey(window.solflare.publicKey?.toString() || null);
        setWalletName('Solflare');
        console.log('Solflare connected via event listener');
      }
    };

    const handleDisconnect = () => {
      setConnected(false);
      setPublicKey(null);
      setWalletName(null);
      console.log('Wallet disconnected via event listener');
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

  const connectPhantom = async () => {
    if (typeof window === 'undefined' || !window.solana?.isPhantom) {
      alert('Phantom wallet not found! Please install Phantom wallet extension.');
      return;
    }

    setConnecting(true);
    try {
      console.log('Attempting to connect to Phantom...');
      const response = await window.solana.connect();
      console.log('Phantom connection response:', response);
      
      setConnected(true);
      setPublicKey(response.publicKey.toString());
      setWalletName('Phantom');
      
      console.log('Phantom connected successfully!', response.publicKey.toString());
    } catch (error) {
      console.error('Phantom connection error:', error);
      alert(`Failed to connect to Phantom: ${(error as Error).message || error}`);
    } finally {
      setConnecting(false);
    }
  };

  const connectSolflare = async () => {
    if (typeof window === 'undefined' || !window.solflare?.isSolflare) {
      alert('Solflare wallet not found! Please install Solflare wallet extension.');
      return;
    }

    setConnecting(true);
    try {
      console.log('Attempting to connect to Solflare...');
      const response = await window.solflare.connect();
      console.log('Solflare connection response:', response);
      
      setConnected(true);
      setPublicKey(response.publicKey?.toString() || null);
      setWalletName('Solflare');
      
      console.log('Solflare connected successfully!', response.publicKey?.toString());
    } catch (error) {
      console.error('Solflare connection error:', error);
      alert(`Failed to connect to Solflare: ${(error as Error).message || error}`);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    if (typeof window !== 'undefined') {
      if (walletName === 'Phantom' && window.solana) {
        window.solana.disconnect();
      } else if (walletName === 'Solflare' && window.solflare) {
        window.solflare.disconnect();
      }
    }
    
    setConnected(false);
    setPublicKey(null);
    setWalletName(null);
    console.log('Wallet disconnected');
  };

  // Don't render until mounted on client side
  if (!mounted) {
    return (
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-semibold">Direct Wallet Connection</h3>
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <h3 className="text-sm font-semibold">Direct Wallet Connection</h3>
      
      {connected ? (
        <div className="flex flex-col space-y-2">
          <div className="text-sm">
            <strong>{walletName}</strong>: {publicKey ? `${publicKey.slice(0, 8)}...${publicKey.slice(-8)}` : 'No public key'}
          </div>
          <Button 
            onClick={disconnect}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          <Button 
            onClick={connectPhantom}
            disabled={connecting || !phantomAvailable}
            size="sm"
            className="w-full"
          >
            {connecting ? 'Connecting...' : 'Connect Phantom'}
          </Button>
          <Button 
            onClick={connectSolflare}
            disabled={connecting || !solflareAvailable}
            size="sm"
            variant="outline"
            className="w-full"
          >
            {connecting ? 'Connecting...' : 'Connect Solflare'}
          </Button>
        </div>
      )}
      
      <div className="text-xs text-gray-600">
        <div>Phantom: {phantomAvailable ? 'Available' : 'Not Found'}</div>
        <div>Solflare: {solflareAvailable ? 'Available' : 'Not Found'}</div>
      </div>
    </div>
  );
};
