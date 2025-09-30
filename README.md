# pNFT Mortgage Market

A decentralized mortgage platform built on Solana that allows users to use programmable NFTs (pNFTs) as collateral for loans.

## 🚀 Features

- **pNFT Creation**: Create programmable NFTs that can be used as collateral
- **Loan Management**: Create, manage, and track loans with real blockchain data
- **Collateral Selection**: Choose from your owned pNFTs as loan collateral
- **Real-time Balance**: Monitor your SOL balance and transaction status
- **Wallet Integration**: Support for Phantom and Solflare wallets

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Blockchain**: Solana, Anchor Framework
- **NFTs**: Metaplex SDK
- **Wallet**: Solana Wallet Adapter
- **Styling**: Tailwind CSS

## 📁 Project Structure

```
pnft-mortgage-market/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions and configurations
│   │   └── types/           # TypeScript type definitions
├── programs/                 # Solana Anchor program
│   └── pnft_mortgage_market/
├── tests/                    # Anchor tests
└── migrations/               # Deployment scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Rust 1.70+
- Solana CLI
- Anchor Framework

### Installation

1. Clone the repository:
```bash
git clone git@github.com:Hell1213/pNFT-Mortgage.git
cd pNFT-Mortgage
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install Rust dependencies (from root)
cargo build
```

3. Start the development server:
```bash
cd frontend
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Development

### Frontend Development

The frontend is built with Next.js and includes:

- **Wallet Integration**: Connect with Phantom or Solflare
- **pNFT Management**: Create and manage programmable NFTs
- **Loan Operations**: Create loans with real blockchain data
- **Real-time Updates**: Live balance and transaction monitoring

### Solana Program

The Anchor program handles:

- **Loan Creation**: Initialize loans with pNFT collateral
- **Collateral Management**: Track and validate pNFT collateral
- **Loan States**: Manage loan lifecycle (active, repaid, liquidated)
- **Auction System**: Handle loan liquidations

## 📱 Usage

1. **Connect Wallet**: Connect your Solana wallet (Phantom/Solflare)
2. **Create pNFT**: Create a programmable NFT for collateral
3. **Create Loan**: Use your pNFT as collateral for a loan
4. **Manage Loans**: View and manage your active loans

## 🔒 Security

- All transactions are signed by the user's wallet
- Smart contracts are audited and tested
- Collateral validation ensures loan security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Solana Foundation
- Metaplex
- Anchor Framework
- Next.js Team

---

**Note**: This is a development version. Use at your own risk.
