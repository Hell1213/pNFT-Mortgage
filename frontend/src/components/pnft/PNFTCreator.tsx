'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePNFT } from '@/hooks/usePNFT';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { NetworkWarning } from '@/components/NetworkWarning';
import { Loader2, Plus, X } from 'lucide-react';

interface Attribute {
  trait_type: string;
  value: string;
}

export const PNFTCreator: React.FC = () => {
  const { createPNFT, loading } = usePNFT();
  const { sol, hasMinimumBalance, getBalanceStatus } = useWalletBalance();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    imageUrl: 'https://via.placeholder.com/300x300',
    estimatedValue: 1000,
    attributes: [] as Attribute[],
  });

  const handleInputChange = (field: string, value: string | number) => {
    // Apply strict character limits to fit within transaction size
    if (field === 'name' && typeof value === 'string' && value.length > 4) {
      value = value.substring(0, 4);
    }
    if (field === 'symbol' && typeof value === 'string' && value.length > 1) {
      value = value.substring(0, 1);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAttribute = () => {
    if (formData.attributes.length < 5) { // Allow up to 5 attributes
      setFormData(prev => ({
        ...prev,
        attributes: [...prev.attributes, { trait_type: '', value: '' }]
      }));
    }
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.symbol.trim()) {
        throw new Error('Symbol is required');
      }

      // Validate character limits
      if (formData.name.length > 4) {
        throw new Error('Name must be 4 characters or less');
      }
      if (formData.symbol.length > 1) {
        throw new Error('Symbol must be 1 character or less');
      }

      // Validate attributes
      const validAttributes = formData.attributes.filter(attr => 
        attr.trait_type.trim() && attr.value.trim()
      );

      console.log('Creating pNFT with metadata:', {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: formData.imageUrl,
        attributes: validAttributes,
        estimatedValue: formData.estimatedValue
      });

      await createPNFT(
        {
          name: formData.name,
          symbol: formData.symbol,
          description: formData.description,
          image: formData.imageUrl,
          attributes: validAttributes,
        },
        formData.estimatedValue
      );

      // Reset form
      setFormData({
        name: '',
        symbol: '',
        description: '',
        imageUrl: 'https://via.placeholder.com/300x300',
        estimatedValue: 1000,
        attributes: [],
      });
    } catch (err) {
      console.error('Error creating pNFT:', err);
      setError(err instanceof Error ? err.message : 'Failed to create pNFT');
    } finally {
      setIsSubmitting(false);
    }
  };

  const balanceStatus = getBalanceStatus();
  const isDisabled = isSubmitting || loading || !hasMinimumBalance() || balanceStatus === 'loading';

  return (
    <div className="space-y-6">
      <NetworkWarning />
      
      <Card>
        <CardHeader>
          <CardTitle>Create pNFT</CardTitle>
          <CardDescription>
            Create a programmable NFT that can be used as collateral
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Wallet Balance */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Wallet Balance:</span>
                <span className={`text-sm font-mono ${
                  balanceStatus === 'sufficient' ? 'text-green-600' : 
                  balanceStatus === 'low' ? 'text-yellow-600' : 
                  balanceStatus === 'insufficient' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {sol.toFixed(6)} SOL
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Status: {balanceStatus}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter NFT name (max 4 chars)"
                maxLength={4}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.name.length}/4 characters (strictly limited for transaction size)
              </div>
            </div>

            {/* Symbol */}
            <div>
              <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
                Symbol *
              </label>
              <input
                type="text"
                id="symbol"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter symbol (max 1 char)"
                maxLength={1}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.symbol.length}/1 character (strictly limited for transaction size)
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description (optional)"
                rows={3}
              />
              <div className="text-xs text-gray-500 mt-1">
                Description is optional to minimize transaction size
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter image URL"
              />
              <div className="text-xs text-gray-500 mt-1">
                Default: https://via.placeholder.com/300x300
              </div>
            </div>

            {/* Estimated Value */}
            <div>
              <label htmlFor="estimatedValue" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Value (USDC)
              </label>
              <input
                type="number"
                id="estimatedValue"
                value={formData.estimatedValue}
                onChange={(e) => handleInputChange('estimatedValue', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter estimated value"
                min="1"
                max="1000000"
              />
            </div>

            {/* Attributes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Attributes (Optional)
                </label>
                <span className="text-xs text-gray-500">
                  {formData.attributes.length}/5 attributes
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Attributes are optional to minimize transaction size
              </div>
              
              {formData.attributes.map((attr, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Trait type"
                    value={attr.trait_type}
                    onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={attr.value}
                    onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {formData.attributes.length < 5 && (
                <button
                  type="button"
                  onClick={addAttribute}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4" />
                  Add Attribute
                </button>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isDisabled}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating pNFT...
                </>
              ) : (
                'Create pNFT'
              )}
            </Button>

            {/* Back Link */}
            <div className="text-center">
              <a
                href="/create-loan"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ← Back to Loan Creation
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
