use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use anchor_spl::associated_token::AssociatedToken;

use crate::states::*;

#[derive(Accounts)]
pub struct CreateVault<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,
    
    #[account(mut, has_one = borrower)]
    pub loan: Account<'info, Loan>,
    
    pub collateral_mint: Account<'info, Mint>,
    
    // Vault to hold collateral
    #[account(
        init,
        payer = borrower,
        space = 8 + Vault::LEN,
        seeds = [
            b"vault",
            loan.key().as_ref()
        ],
        bump
    )]
    pub vault: Account<'info, Vault>,
    
    // Token accounts
    #[account(
        init_if_needed,
        payer = borrower,
        associated_token::mint = collateral_mint,
        associated_token::authority = vault
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<CreateVault>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let loan = &ctx.accounts.loan;

    // Initialize vault
    vault.loan = loan.key();
    vault.collateral_mint = loan.collateral_mint;
    vault.bump = ctx.bumps.vault;

    Ok(())
}
