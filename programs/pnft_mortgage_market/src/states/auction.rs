use anchor_lang::prelude::*;

#[account]
pub struct Auction {
    pub loan: Pubkey,              // 32 bytes
    pub collateral_mint: Pubkey,   // 32 bytes
    pub starting_price: u64,       // 8 bytes
    pub current_bid: u64,          // 8 bytes
    pub current_bidder: Pubkey,    // 32 bytes
    pub end_time: i64,             // 8 bytes
    pub status: AuctionStatus,     // 1 byte
    pub bump: u8,                  // 1 byte
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AuctionStatus {
    Active,
    Settled,
    Cancelled,
}

impl Auction {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 32 + 8 + 1 + 1;
    
    pub fn is_active(&self, current_time: i64) -> bool {
        self.status == AuctionStatus::Active && current_time < self.end_time
    }
}
