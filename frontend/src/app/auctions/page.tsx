'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuctionsPage() {
  const { connected, publicKey } = useWallet();
  const [bidAmount, setBidAmount] = useState('');

  // Mock auction data
  const auctions = [
    {
      id: '1',
      pnftName: 'Cool NFT #1234',
      pnftImage: '/api/placeholder/300/300',
      currentBid: 2.5,
      timeLeft: '2h 15m',
      status: 'active',
      loanAmount: 2.0,
      interestRate: 5,
    },
    {
      id: '2',
      pnftName: 'Rare Art #5678',
      pnftImage: '/api/placeholder/300/300',
      currentBid: 1.8,
      timeLeft: '45m',
      status: 'active',
      loanAmount: 1.5,
      interestRate: 7,
    },
    {
      id: '3',
      pnftName: 'Gaming Item #9999',
      pnftImage: '/api/placeholder/300/300',
      currentBid: 0.8,
      timeLeft: 'Ended',
      status: 'ended',
      loanAmount: 0.6,
      interestRate: 4,
    },
  ];

  const handleBid = (auctionId: string) => {
    if (!bidAmount) return;
    // TODO: Implement bidding logic
    console.log(`Bidding ${bidAmount} SOL on auction ${auctionId}`);
  };

  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
            <CardDescription>
              Please connect your wallet to participate in auctions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                pNFT Mortgage Market
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/create-loan" className="text-gray-600 hover:text-gray-900">
                  Create Loan
                </Link>
                <Link href="/auctions" className="text-blue-600 font-medium">
                  Auctions
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Liquidation Auctions</h1>
          <p className="text-gray-600">Participate in auctions for liquidated pNFTs</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
              <p className="text-sm text-gray-600">Active Auctions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600 mb-2">5.1 SOL</div>
              <p className="text-sm text-gray-600">Total Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600 mb-2">12</div>
              <p className="text-sm text-gray-600">Total Bids</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600 mb-2">2.1 SOL</div>
              <p className="text-sm text-gray-600">Average Bid</p>
            </CardContent>
          </Card>
        </div>

        {/* Auctions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <Card key={auction.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    auction.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {auction.status}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{auction.pnftName}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Bid:</span>
                    <span className="font-medium">{auction.currentBid} SOL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time Left:</span>
                    <span className="font-medium">{auction.timeLeft}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Original Loan:</span>
                    <span className="font-medium">{auction.loanAmount} SOL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Interest Rate:</span>
                    <span className="font-medium">{auction.interestRate}%</span>
                  </div>
                </div>
                
                {auction.status === 'active' && (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="Bid amount"
                        step="0.01"
                        min={auction.currentBid + 0.01}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button
                        onClick={() => handleBid(auction.id)}
                        disabled={!bidAmount || parseFloat(bidAmount) <= auction.currentBid}
                        size="sm"
                      >
                        Bid
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Minimum bid: {(auction.currentBid + 0.01).toFixed(2)} SOL
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No auctions message */}
        {auctions.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Auctions</h3>
                <p className="text-gray-600">There are currently no liquidation auctions available.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
