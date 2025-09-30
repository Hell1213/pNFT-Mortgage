use anchor_lang::prelude::*;

#[account]
pub struct Protocol {
    pub authority: Pubkey,         // 32 bytes
    pub treasury: Pubkey,          // 32 bytes
    pub fee_rate: u16,             // 2 bytes - basis points
    pub total_loans: u64,          // 8 bytes
    pub total_volume: u64,         // 8 bytes
    pub bump: u8,                  // 1 byte
}

impl Protocol {
    pub const LEN: usize = 32 + 32 + 2 + 8 + 8 + 1;
}
