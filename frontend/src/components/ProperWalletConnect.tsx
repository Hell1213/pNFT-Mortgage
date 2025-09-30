'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const ProperWalletConnect: React.FC = () => {
  const { publicKey, connected, connecting, disconnect, wallet } = useWallet();

  if (connected && publicKey) {
    return (
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-semibold">Wallet Connected</h3>
        <div className="text-sm">
          <strong>{wallet?.adapter.name}</strong>: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
        </div>
        <Button 
          onClick={() => disconnect()}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <h3 className="text-sm font-semibold">Connect Wallet</h3>
      <WalletMultiButton 
        className="!w-full !h-8 !text-xs"
      />
      {connecting && (
        <div className="text-xs text-gray-500">Connecting...</div>
      )}
    </div>
  );
};
