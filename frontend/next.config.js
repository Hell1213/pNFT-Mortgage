/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Allow importing JSON files
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
  // Enable experimental features for better compatibility
  experimental: {
    esmExternals: "loose",
  },
  // Transpile Solana packages
  transpilePackages: [
    "@solana/wallet-adapter-base",
    "@solana/wallet-adapter-react",
    "@solana/wallet-adapter-react-ui",
    "@solana/wallet-adapter-wallets",
    "@solana/web3.js",
    "@coral-xyz/anchor",
    "@metaplex-foundation/js",
  ],
};

module.exports = nextConfig;
