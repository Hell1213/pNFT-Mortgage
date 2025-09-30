use anchor_lang::prelude::*;

#[account]
pub struct Vault {
    pub loan: Pubkey,              // 32 bytes
    pub collateral_mint: Pubkey,   // 32 bytes
    pub authority: Pubkey,         // 32 bytes - vault authority
    pub bump: u8,                  // 1 byte
}

impl Vault {
    pub const LEN: usize = 32 + 32 + 32 + 1;
}
