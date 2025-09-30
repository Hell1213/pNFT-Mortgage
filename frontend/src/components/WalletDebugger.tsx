'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export const WalletDebugger: React.FC = () => {
  const { 
    connected, 
    publicKey, 
    wallet, 
    connecting, 
    connect,
    select,
    wallets,
    disconnect,
    signTransaction,
    signAllTransactions
  } = useWallet();
  
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const info = {
      // Wallet state
      connected,
      publicKey: publicKey?.toString(),
      wallet: wallet?.adapter.name,
      connecting,
      walletsCount: wallets.length,
      
      // Wallet functions
      hasSignTransaction: !!signTransaction,
      hasSignAllTransactions: !!signAllTransactions,
      
      // Browser wallet detection
      windowSolana: !!window.solana,
      windowSolflare: !!window.solflare,
      phantomConnected: window.solana?.isConnected,
      solflareConnected: window.solflare?.isConnected,
      
      // Wallet adapter details
      walletAdapters: wallets.map(w => ({
        name: w.adapter.name,
        readyState: w.adapter.readyState,
        connected: w.adapter.connected,
        connecting: w.adapter.connecting,
        publicKey: w.adapter.publicKey?.toString()
      }))
    };
    
    setDebugInfo(info);
    console.log('=== WALLET DEBUG INFO ===', info);
  }, [connected, publicKey, wallet, connecting, wallets, signTransaction, signAllTransactions]);

  const testDirectConnection = async () => {
    console.log('=== TESTING DIRECT CONNECTION ===');
    
    if (window.solana?.isPhantom) {
      try {
        console.log('Testing Phantom direct connection...');
        const response = await window.solana.connect();
        console.log('Phantom response:', response);
      } catch (error) {
        console.error('Phantom error:', error);
      }
    }
    
    if (window.solflare?.isSolflare) {
      try {
        console.log('Testing Solflare direct connection...');
        const response = await window.solflare.connect();
        console.log('Solflare response:', response);
      } catch (error) {
        console.error('Solflare error:', error);
      }
    }
  };

  const testWalletAdapter = async () => {
    console.log('=== TESTING WALLET ADAPTER ===');
    console.log('Available wallets:', wallets.map(w => w.adapter.name));
    
    if (wallets.length > 0) {
      try {
        console.log('Selecting first wallet...');
        await select(wallets[0].adapter.name);
        
        console.log('Connecting...');
        await connect();
        
        console.log('Connection attempt completed');
      } catch (error) {
        console.error('Wallet adapter error:', error);
      }
    }
  };

  if (!mounted) {
    return <div>Loading debugger...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border text-xs max-w-md max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2">Wallet Debugger</h3>
      
      <div className="space-y-2 mb-4">
        <div><strong>Connected:</strong> {connected ? 'Yes' : 'No'}</div>
        <div><strong>Public Key:</strong> {publicKey ? publicKey.toString().slice(0, 8) + '...' : 'None'}</div>
        <div><strong>Wallet:</strong> {wallet?.adapter.name || 'None'}</div>
        <div><strong>Connecting:</strong> {connecting ? 'Yes' : 'No'}</div>
        <div><strong>Wallets:</strong> {wallets.length}</div>
        <div><strong>Sign Functions:</strong> {signTransaction ? 'Yes' : 'No'}</div>
      </div>

      <div className="space-y-2 mb-4">
        <div><strong>Browser Wallets:</strong></div>
        <div>• Phantom: {window.solana ? 'Available' : 'Not Found'}</div>
        <div>• Solflare: {window.solflare ? 'Available' : 'Not Found'}</div>
        <div>• Phantom Connected: {window.solana?.isConnected ? 'Yes' : 'No'}</div>
        <div>• Solflare Connected: {window.solflare?.isConnected ? 'Yes' : 'No'}</div>
      </div>

      <div className="space-y-2 mb-4">
        <div><strong>Wallet Adapters:</strong></div>
        {wallets.map((w, i) => (
          <div key={i} className="text-xs">
            • {w.adapter.name}: {w.adapter.readyState} | {w.adapter.connected ? 'Connected' : 'Disconnected'}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <button 
          onClick={testDirectConnection}
          className="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Test Direct Connection
        </button>
        <button 
          onClick={testWalletAdapter}
          className="w-full bg-green-500 text-white px-2 py-1 rounded text-xs"
        >
          Test Wallet Adapter
        </button>
        {connected && (
          <button 
            onClick={() => disconnect()}
            className="w-full bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
};
