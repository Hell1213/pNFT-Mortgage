use anchor_lang::prelude::*;
use crate::states::Protocol;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Protocol::LEN,
        seeds = [b"protocol"],
        bump
    )]
    pub protocol: Account<'info, Protocol>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: This is the treasury account for protocol fees
    #[account(mut)]
    pub treasury: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let protocol = &mut ctx.accounts.protocol;
    
    protocol.authority = ctx.accounts.authority.key();
    protocol.treasury = ctx.accounts.treasury.key();
    protocol.fee_rate = 50; // 0.5% fee
    protocol.total_loans = 0;
    protocol.total_volume = 0;
    protocol.bump = ctx.bumps.protocol;
    
    msg!("Protocol initialized with authority: {}", protocol.authority);
    
    Ok(())
}
