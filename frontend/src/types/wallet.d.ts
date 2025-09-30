// TypeScript declarations for wallet extensions

interface PhantomWallet {
  isPhantom: boolean;
  isConnected: boolean;
  publicKey: {
    toString(): string;
  } | null;
  connect(): Promise<{
    publicKey: {
      toString(): string;
    };
  }>;
  disconnect(): Promise<void>;
  on(event: string, callback: () => void): void;
  removeListener(event: string, callback: () => void): void;
}

interface SolflareWallet {
  isSolflare: boolean;
  isConnected: boolean;
  publicKey: {
    toString(): string;
  } | null;
  connect(): Promise<{
    publicKey: {
      toString(): string;
    };
  }>;
  disconnect(): Promise<void>;
  on(event: string, callback: () => void): void;
  removeListener(event: string, callback: () => void): void;
}

declare global {
  interface Window {
    solana?: PhantomWallet;
    solflare?: SolflareWallet;
  }
}

export {};
