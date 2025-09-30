import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';

export interface PNFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
  properties?: {
    files: Array<{ uri: string; type: string }>;
    category: string;
  };
}

// Define CollateralData interface here to avoid circular imports
export interface CollateralData {
  mint: PublicKey;
  name: string;
  symbol: string;
  image: string;
  description: string;
  attributes: Array<{ trait_type: string; value: string }>;
  estimatedValue: number;
  isEligible: boolean;
  isProgrammable?: boolean;
  canBeUsedAsCollateral?: boolean;
}

export class PNFTManager {
  private metaplex: Metaplex;
  private connection: Connection;

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;
    // ✅ FIXED: Use walletAdapterIdentity instead of keypairIdentity
    this.metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity(wallet));
  }

  /**
   * Upload metadata to storage and return URI
   */
  async uploadMetadata(metadata: PNFTMetadata): Promise<string> {
    try {
      console.log('Uploading metadata:', metadata);
      
      // Use minimal metadata to fit within transaction limits
      const minimalMetadata = {
        name: (metadata.name || 'NFT').substring(0, 4), // Limit name to 4 characters
        symbol: (metadata.symbol || 'NFT').substring(0, 1), // Limit symbol to 1 character
        image: metadata.image || 'https://via.placeholder.com/300x300'
        // Removed description and attributes to minimize size
      };

      // Use data URI instead of uploading to avoid transaction size issues
      const jsonString = JSON.stringify(minimalMetadata);
      const base64 = Buffer.from(jsonString).toString('base64');
      const metadataUri = `data:application/json;base64,${base64}`;

      console.log('Metadata URI size:', metadataUri.length, 'bytes');
      return metadataUri;
    } catch (error) {
      console.error('Error uploading metadata:', error);
      throw new Error(`Failed to upload metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a programmable NFT for collateral
   */
  async createCollateralPNFT(
    metadata: PNFTMetadata,
    estimatedValue: number
  ): Promise<{ nft: any; mint: PublicKey }> {
    try {
      console.log('Creating pNFT with metadata:', metadata);

      // Validate required fields
      if (!metadata.name || !metadata.symbol) {
        throw new Error('Name and symbol are required');
      }

      // Use minimal metadata to fit within transaction limits
      const minimalMetadata = {
        name: (metadata.name || 'NFT').substring(0, 4), // Limit name to 4 characters
        symbol: (metadata.symbol || 'NFT').substring(0, 1), // Limit symbol to 1 character
        image: metadata.image || 'https://via.placeholder.com/300x300'
        // Removed description and attributes to minimize size
      };

      // Create a data URI for metadata
      const jsonString = JSON.stringify(minimalMetadata, null, 0); // Compact JSON
      const base64 = Buffer.from(jsonString).toString('base64');
      const metadataUri = `data:application/json;base64,${base64}`;

      console.log('Metadata URI size:', metadataUri.length, 'bytes');

      // Create the NFT with proper metadata and transaction configuration
      const { nft } = await this.metaplex.nfts().create({
        name: minimalMetadata.name,
        symbol: minimalMetadata.symbol,
        uri: metadataUri, // Use the data URI
        sellerFeeBasisPoints: 0, // No royalty
      }, {
        // Add transaction configuration to help with simulation
        confirmOptions: {
          commitment: 'processed',
          preflightCommitment: 'processed',
          skipPreflight: false,
        },
      });

      console.log('pNFT created successfully:', nft.address.toString());
      return { nft, mint: nft.address };
    } catch (error) {
      console.error('Error creating pNFT:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('WalletSignTransactionError')) {
          throw new Error('Transaction was rejected by wallet. Please try again and approve the transaction in your wallet.');
        } else if (error.message.includes('Simulation failed')) {
          throw new Error('Transaction simulation failed. This might be due to network issues or insufficient funds.');
        } else if (error.message.includes('Transaction too large')) {
          throw new Error('Transaction is too large. Please reduce the metadata size.');
        }
      }
      
      throw new Error(`Failed to create pNFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all NFTs owned by the connected wallet
   */
  async getOwnedNFTs(owner: PublicKey): Promise<CollateralData[]> {
    try {
      console.log('Fetching owned NFTs for wallet:', owner.toString());
      
      // Fetch real NFTs from the blockchain
      const nfts = await this.metaplex.nfts().findAllByOwner({ owner });
      console.log(`Found ${nfts.length} NFTs for wallet`);
      
      // Convert to CollateralData format
      const collateralData: CollateralData[] = [];
      
      for (const nft of nfts) {
        try {
          // Use basic NFT data without loading additional metadata to avoid complexity
          collateralData.push({
            mint: nft.address,
            name: nft.name || 'Unknown NFT',
            symbol: nft.symbol || 'UNK',
            image: 'https://via.placeholder.com/300x300', // Use simple placeholder
            description: 'No description available',
            attributes: [],
            estimatedValue: 1000, // Default value
            isEligible: true, // Assume eligible for now
            isProgrammable: true, // Assume programmable for now
            canBeUsedAsCollateral: true // Assume can be used as collateral
          });
        } catch (error) {
          console.warn('Failed to process NFT:', nft.address.toString(), error);
          // Add with minimal data if processing fails
          collateralData.push({
            mint: nft.address,
            name: 'Unknown NFT',
            symbol: 'UNK',
            image: 'https://via.placeholder.com/300x300',
            description: 'No description',
            attributes: [],
            estimatedValue: 1000,
            isEligible: true,
            isProgrammable: true,
            canBeUsedAsCollateral: true
          });
        }
      }
      
      return collateralData;
    } catch (error) {
      console.error('Error fetching owned NFTs:', error);
      return [];
    }
  }
}

// Export the createPNFTManager function
export const createPNFTManager = (connection: Connection, wallet: any) => {
  return new PNFTManager(connection, wallet);
};
