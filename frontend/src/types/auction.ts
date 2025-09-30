export interface Auction {
  loan: string;
  collateralMint: string;
  highestBid: number;
  highestBidder: string;
  endTime: number;
  status: AuctionStatus;
  bump: number;
}

export enum AuctionStatus {
  Active = "active",
  Ended = "ended",
  Settled = "settled"
}

export interface Bid {
  bidder: string;
  amount: number;
  timestamp: number;
}
