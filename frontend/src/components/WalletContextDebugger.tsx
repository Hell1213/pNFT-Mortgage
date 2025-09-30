'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export const WalletContextDebugger: React.FC = () => {
  const wallet = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('=== WALLET CONTEXT DEBUG ===');
    console.log('useWallet() result:', {
      connected: wallet.connected,
      publicKey: wallet.publicKey?.toString(),
      wallet: wallet.wallet?.adapter.name,
      connecting: wallet.connecting,
      disconnecting: wallet.disconnecting,
      wallets: wallet.wallets.map(w => w.adapter.name),
      signTransaction: !!wallet.signTransaction,
      signAllTransactions: !!wallet.signAllTransactions,
      select: !!wallet.select,
      connect: !!wallet.connect,
      disconnect: !!wallet.disconnect,
    });
  }, [wallet]);

  if (!mounted) {
    return <div>Loading context debugger...</div>;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-100 p-4 rounded-lg shadow-lg border text-xs max-w-md">
      <h3 className="font-bold mb-2">Wallet Context Debug</h3>
      <div className="space-y-1">
        <div><strong>Connected:</strong> {wallet.connected ? 'Yes' : 'No'}</div>
        <div><strong>Public Key:</strong> {wallet.publicKey?.toString() || 'None'}</div>
        <div><strong>Wallet:</strong> {wallet.wallet?.adapter.name || 'None'}</div>
        <div><strong>Connecting:</strong> {wallet.connecting ? 'Yes' : 'No'}</div>
        <div><strong>Wallets:</strong> {wallet.wallets.length}</div>
        <div><strong>Sign Functions:</strong> {wallet.signTransaction ? 'Yes' : 'No'}</div>
        <div><strong>Functions Available:</strong></div>
        <div>• select: {typeof wallet.select === 'function' ? 'Yes' : 'No'}</div>
        <div>• connect: {typeof wallet.connect === 'function' ? 'Yes' : 'No'}</div>
        <div>• disconnect: {typeof wallet.disconnect === 'function' ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
};
