"use client";

import React, { useState } from "react";
import { useLoans } from "@/hooks/useLoans";
import { usePNFT } from "@/hooks/usePNFT";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CollateralSelector } from "@/components/pnft/CollateralSelector";
import { PNFTCreator } from "@/components/pnft/PNFTCreator";
import { CollateralData } from "@/lib/pnft-manager";
import { ProgramDebugger } from "@/components/ProgramDebugger";
import Link from "next/link";

export default function CreateLoanPage() {
  const { createLoan, loading, error } = useLoans();
  const { isConnected } = usePNFT();
  const [formData, setFormData] = useState({
    loanAmount: 1,
    interestRate: 5,
    duration: 30,
    liquidationThreshold: 80,
  });
  const [selectedCollateral, setSelectedCollateral] =
    useState<CollateralData | null>(null);
  const [showPNFTCreator, setShowPNFTCreator] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCollateral) {
      alert("Please select a collateral NFT");
      return;
    }

    try {
      console.log("Submitting loan creation form with real collateral...");
      await createLoan({
        ...formData,
        collateralMint: selectedCollateral.mint.toString(),
      });
      alert("Loan created successfully!");

      // Reset form
      setFormData({
        loanAmount: 1,
        interestRate: 5,
        duration: 30,
        liquidationThreshold: 80,
      });
      setSelectedCollateral(null);
    } catch (err) {
      console.error("Error creating loan:", err);
      alert(
        "Error creating loan: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleCollateralSelected = (collateral: CollateralData) => {
    setSelectedCollateral(collateral);
    setShowPNFTCreator(false);
  };

  const handlePNFTCreated = (mint: string) => {
    setShowPNFTCreator(false);
    // Refresh the collateral selector to show the new pNFT
    window.location.reload();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600 mb-4">
              Please connect your wallet to create a loan
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Go to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  ← Back to Home
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Create Loan</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Debug Info */}
        <div className="mb-8">
          <ProgramDebugger />
        </div>

        {showPNFTCreator ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Create pNFT
              </h2>
              <p className="text-gray-600 mb-8">
                Create a programmable NFT that can be used as collateral
              </p>
            </div>
            <PNFTCreator />
            <div className="text-center">
              <Button
                onClick={() => setShowPNFTCreator(false)}
                variant="outline"
              >
                ← Back to Loan Creation
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Collateral Selection */}
            <div className="space-y-6">
              <CollateralSelector
                onCollateralSelected={handleCollateralSelected}
                selectedCollateral={selectedCollateral}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Don't have a pNFT?</CardTitle>
                  <CardDescription>
                    Create a programmable NFT that can be used as collateral
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setShowPNFTCreator(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Create pNFT
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Loan Form */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Parameters</CardTitle>
                <CardDescription>
                  Set up your loan terms and requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="loanAmount"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Loan Amount (SOL)
                    </label>
                    <input
                      type="number"
                      id="loanAmount"
                      name="loanAmount"
                      value={formData.loanAmount}
                      onChange={handleInputChange}
                      min="0.1"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="interestRate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      id="interestRate"
                      name="interestRate"
                      value={formData.interestRate}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="duration"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      max="365"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="liquidationThreshold"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Liquidation Threshold (%)
                    </label>
                    <input
                      type="number"
                      id="liquidationThreshold"
                      name="liquidationThreshold"
                      value={formData.liquidationThreshold}
                      onChange={handleInputChange}
                      min="50"
                      max="95"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm">Error: {error}</div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || !selectedCollateral}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? "Creating Loan..." : "Create Loan"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loan Summary */}
        {selectedCollateral && !showPNFTCreator && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Loan Summary</CardTitle>
                <CardDescription>
                  Review your loan terms before creating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Loan Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loan Amount:</span>
                        <span className="font-semibold">
                          {formData.loanAmount} SOL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Interest Rate:</span>
                        <span className="font-semibold">
                          {formData.interestRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold">
                          {formData.duration} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Liquidation Threshold:
                        </span>
                        <span className="font-semibold">
                          {formData.liquidationThreshold}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Collateral Details</h4>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        {selectedCollateral.image ? (
                          <img
                            src={selectedCollateral.image}
                            alt={selectedCollateral.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg
                              className="w-8 h-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              ></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {selectedCollateral.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Value: $
                          {selectedCollateral.estimatedValue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Required: ${(formData.loanAmount * 1.2).toFixed(2)}{" "}
                          SOL
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Repayment:</span>
                    <span className="font-semibold">
                      {(
                        formData.loanAmount *
                        (1 + formData.interestRate / 100)
                      ).toFixed(2)}{" "}
                      SOL
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
