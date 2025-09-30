use anchor_lang::prelude::*;

#[account]
pub struct Loan {
    pub borrower: Pubkey,           // 32 bytes
    pub lender: Pubkey,             // 32 bytes  
    pub collateral_mint: Pubkey,    // 32 bytes - pNFT mint
    pub loan_amount: u64,           // 8 bytes
    pub outstanding_amount: u64,    // 8 bytes - principal + interest
    pub interest_rate: u16,         // 2 bytes - basis points
    pub duration: i64,              // 8 bytes - loan term in seconds
    pub start_time: i64,            // 8 bytes - unix timestamp
    pub status: LoanStatus,         // 1 byte
    pub liquidation_threshold: u16,  // 2 bytes - percentage
    pub bump: u8,                   // 1 byte - PDA bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum LoanStatus {
    Active,
    Repaid,  
    Liquidated,
    InAuction,
}

impl Loan {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 8 + 2 + 8 + 8 + 1 + 2 + 1;
    
    pub fn is_liquidatable(&self, current_time: i64, collateral_value: u64) -> bool {
        // Check if loan has expired or is undercollateralized
        let is_expired = current_time > self.start_time + self.duration;
        let collateral_ratio = (collateral_value * 10000) / self.outstanding_amount;
        let is_undercollateralized = collateral_ratio < self.liquidation_threshold as u64;
        
        is_expired || is_undercollateralized
    }
    
    pub fn calculate_interest(&self, current_time: i64) -> u64 {
        let elapsed = current_time - self.start_time;
        let annual_rate = self.interest_rate as u64;
        (self.loan_amount * annual_rate * elapsed as u64) / (10000 * 365 * 24 * 3600)
    }
}
