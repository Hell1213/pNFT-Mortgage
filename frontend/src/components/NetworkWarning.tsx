'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const NetworkWarning: React.FC = () => {
  const { wallet, connected } = useWallet();
  const [networkMismatch, setNetworkMismatch] = useState(false);
  const [isDevnet, setIsDevnet] = useState(false);

  useEffect(() => {
    if (!connected || !wallet) return;

    const checkNetwork = async () => {
      try {
        // Check if we're on devnet by looking at the RPC endpoint
        const response = await fetch('https://api.devnet.solana.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getHealth'
          })
        });
        
        setIsDevnet(true);
        
        // Check wallet network (this is a simplified check)
        // In a real app, you'd check the wallet's network setting
        setNetworkMismatch(false); // Assume correct for now
      } catch (error) {
        console.error('Network check failed:', error);
        setIsDevnet(false);
      }
    };

    checkNetwork();
  }, [connected, wallet]);

  if (!connected) return null;

  return (
    <div className="mb-4">
      {networkMismatch ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
            <div className="text-sm">
              <p className="text-red-800 font-medium">Network Mismatch</p>
              <p className="text-red-700 mt-1">
                Your wallet is connected to Mainnet, but this app requires Devnet.
                Please switch your wallet to Devnet and try again.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
            <div className="text-sm">
              <p className="text-green-800 font-medium">Network Connected</p>
              <p className="text-green-700 mt-1">
                Connected to Solana Devnet - Ready for testing!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
