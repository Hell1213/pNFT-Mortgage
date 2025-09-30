// Configuration constants for the pNFT Mortgage Market
export const CONFIG = {
  // Solana Network Configuration
  SOLANA_RPC_URL: 'https://api.devnet.solana.com',
  SOLANA_WS_URL: 'wss://api.devnet.solana.com',
  
  // Alternative RPC endpoints for better reliability
  ALTERNATIVE_RPC_URLS: [
    'https://api.devnet.solana.com',
    'https://devnet.helius-rpc.com/?api-key=your-key',
    'https://rpc.ankr.com/solana_devnet',
  ],
  
  // Program Configuration
  PROGRAM_ID: 'C2kfwjLdi7uJjfNeE25MYqviPcvSokwpxRyrrhYaGCf6',
  
  // Pyth Price Feed Configuration
  PYTH_PRICE_FEED_ID: 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG', // SOL/USD
  
  // Loan Configuration
  DEFAULT_LOAN_PARAMS: {
    MIN_LOAN_AMOUNT: 100, // USDC
    MAX_LOAN_AMOUNT: 100000, // USDC
    MIN_INTEREST_RATE: 1, // 1% APR
    MAX_INTEREST_RATE: 50, // 50% APR
    MIN_DURATION: 7, // 7 days
    MAX_DURATION: 365, // 365 days
    DEFAULT_LIQUIDATION_THRESHOLD: 80, // 80%
  },
  
  // UI Configuration
  REFRESH_INTERVAL: 5000, // 5 seconds
  MAX_RETRIES: 3,
  TRANSACTION_TIMEOUT: 30000, // 30 seconds
  
  // Minimum SOL balance for transactions (in lamports)
  MIN_SOL_BALANCE: 0.01, // 0.01 SOL
  
  // Metaplex Configuration
  METAPLEX_STORAGE: {
    BUNDLR_ADDRESS: 'https://devnet.bundlr.network',
    BUNDLR_PROVIDER_URL: 'https://api.devnet.solana.com',
    BUNDLR_TIMEOUT: 60000,
  },
  
  // Error Messages
  ERROR_MESSAGES: {
    INSUFFICIENT_SOL: 'Insufficient SOL balance for transaction',
    WALLET_NOT_CONNECTED: 'Please connect your wallet',
    TRANSACTION_FAILED: 'Transaction failed. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
  },
  
  // Success Messages
  SUCCESS_MESSAGES: {
    PNFT_CREATED: 'pNFT created successfully!',
    LOAN_CREATED: 'Loan created successfully!',
    TRANSACTION_CONFIRMED: 'Transaction confirmed!',
  },
};

// Helper function to get a random RPC URL for load balancing
export const getRandomRpcUrl = () => {
  const urls = CONFIG.ALTERNATIVE_RPC_URLS;
  return urls[Math.floor(Math.random() * urls.length)];
};

// Helper function to check if we're on devnet
export const isDevnet = () => {
  return CONFIG.SOLANA_RPC_URL.includes('devnet');
};

// Helper function to get network name
export const getNetworkName = () => {
  return isDevnet() ? 'Devnet' : 'Mainnet';
};
