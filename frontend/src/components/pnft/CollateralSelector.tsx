'use client';

import React, { useState, useEffect } from 'react';
import { usePNFT } from '@/hooks/usePNFT';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CollateralData } from '@/lib/pnft-manager';

interface CollateralSelectorProps {
  onCollateralSelected?: (collateral: CollateralData) => void;
  selectedCollateral?: CollateralData | null;
}

export const CollateralSelector: React.FC<CollateralSelectorProps> = ({ 
  onCollateralSelected, 
  selectedCollateral 
}) => {
  const { 
    ownedNFTs, 
    getEligibleCollateralNFTs, 
    loading, 
    error, 
    fetchOwnedNFTs 
  } = usePNFT();
  
  const [selectedMint, setSelectedMint] = useState<string | null>(
    selectedCollateral?.mint.toString() || null
  );

  useEffect(() => {
    fetchOwnedNFTs();
  }, [fetchOwnedNFTs]);

  const eligibleNFTs = getEligibleCollateralNFTs();

  const handleSelectCollateral = (nft: CollateralData) => {
    setSelectedMint(nft.mint.toString());
    onCollateralSelected?.(nft);
  };

  const getStatusBadge = (nft: CollateralData) => {
    if (!nft.isProgrammable) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Not Programmable</span>;
    }
    if (!nft.canBeUsedAsCollateral) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Not Eligible</span>;
    }
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Eligible</span>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your NFTs...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchOwnedNFTs} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (eligibleNFTs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Eligible Collateral</CardTitle>
          <CardDescription>
            You don't have any NFTs that can be used as collateral
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <p className="text-gray-600 mb-4">
              To use NFTs as collateral, they must be programmable NFTs (pNFTs) with collateral attributes.
            </p>
            <Button 
              onClick={() => window.location.href = '/create-pnft'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create pNFT
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Collateral</CardTitle>
        <CardDescription>
          Choose a programmable NFT to use as collateral for your loan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {eligibleNFTs.map((nft) => (
            <div
              key={nft.mint.toString()}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedMint === nft.mint.toString()
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSelectCollateral(nft)}
            >
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                {nft.image ? (
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-sm truncate">{nft.name}</h3>
                  {getStatusBadge(nft)}
                </div>
                
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Value:</span>
                    <span className="font-semibold">${nft.estimatedValue.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Attributes:</span>
                    <span>{nft.attributes.length}</span>
                  </div>
                </div>
                
                {selectedMint === nft.mint.toString() && (
                  <div className="text-xs text-blue-600 font-medium">
                    ✓ Selected as collateral
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {selectedCollateral && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Selected Collateral</h4>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                {selectedCollateral.image ? (
                  <img
                    src={selectedCollateral.image}
                    alt={selectedCollateral.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold">{selectedCollateral.name}</p>
                <p className="text-sm text-gray-600">
                  Estimated Value: ${selectedCollateral.estimatedValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
