export interface PNFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: {
    files: Array<{
      uri: string;
      type: string;
    }>;
    category: string;
  };
}

export interface PNFT {
  mint: string;
  metadata: PNFTMetadata;
  owner: string;
  programmableConfig?: {
    ruleSet: string;
  };
}

export interface CollateralValuation {
  pnft: PNFT;
  estimatedValue: number;
  confidence: number;
  lastUpdated: number;
}
