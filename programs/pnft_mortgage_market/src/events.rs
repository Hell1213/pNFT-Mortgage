use anchor_lang::prelude::*;

#[event]
pub struct LoanCreated {
    pub loan: Pubkey,
    pub borrower: Pubkey,
    pub lender: Pubkey,
    pub collateral_mint: Pubkey,
    pub amount: u64,
    pub duration: i64,
    pub interest_rate: u16,
}

#[event]
pub struct CollateralDeposited {
    pub loan: Pubkey,
    pub collateral_mint: Pubkey,
    pub amount: u64,
}

#[event]
pub struct LoanRepaid {
    pub loan: Pubkey,
    pub borrower: Pubkey,
    pub amount: u64,
}

#[event]
pub struct LoanLiquidated {
    pub loan: Pubkey,
    pub liquidator: Pubkey,
    pub collateral_mint: Pubkey,
}

#[event]
pub struct AuctionStarted {
    pub loan: Pubkey,
    pub collateral_mint: Pubkey,
    pub starting_price: u64,
    pub end_time: i64,
}

#[event]
pub struct BidPlaced {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
}

#[event]
pub struct AuctionSettled {
    pub auction: Pubkey,
    pub winner: Pubkey,
    pub winning_bid: u64,
}
