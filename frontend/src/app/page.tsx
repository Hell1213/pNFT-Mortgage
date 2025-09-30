'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProperWalletConnect } from '@/components/ProperWalletConnect';
import { WalletDebugger } from '@/components/WalletDebugger';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">pNFT Mortgage Market</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ProperWalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Programmable NFT
            <span className="text-blue-600"> Mortgage Market</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The first DeFi platform that allows you to use programmable NFTs as collateral for loans, 
            with on-chain liquidation auctions and atomic settlement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-loan">
              <Button size="lg" className="w-full sm:w-auto">
                Create Loan
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Core Innovations */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Programmable Collateral</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Use programmable NFTs as collateral with custom rules and restrictions 
                that can be enforced on-chain.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Atomic Settlement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Loans are settled atomically with the collateral transfer, 
                eliminating counterparty risk and ensuring instant settlement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600">On-chain Liquidation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automated liquidation auctions ensure fair price discovery 
                and protect lenders from undercollateralized positions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Create pNFT</h3>
              <p className="text-gray-600">
                Create or use existing programmable NFTs as collateral
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Set Loan Terms</h3>
              <p className="text-gray-600">
                Define loan amount, interest rate, and duration
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Funding</h3>
              <p className="text-gray-600">
                Lenders provide liquidity and receive interest
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Repay or Liquidate</h3>
              <p className="text-gray-600">
                Repay loan or trigger liquidation auction
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Platform Statistics
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">$0</div>
              <div className="text-gray-600">Total Value Locked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <div className="text-gray-600">Active Loans</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-gray-600">pNFTs Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
              <div className="text-gray-600">Liquidation Auctions</div>
            </div>
          </div>
        </div>

        {/* Debug Section - Remove in production */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
          <WalletDebugger />
        </div>
      </main>
    </div>
  );
}
