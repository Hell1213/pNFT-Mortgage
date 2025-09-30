use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer};

use crate::states::*;
use crate::events::*;

#[derive(Accounts)]
pub struct DepositCollateral<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,
    
    #[account(
        mut,
        constraint = loan.borrower == borrower.key(),
        constraint = loan.status == LoanStatus::Active
    )]
    pub loan: Account<'info, Loan>,
    
    #[account(
        mut,
        constraint = vault.loan == loan.key()
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(
        mut,
        constraint = borrower_token.mint == loan.collateral_mint,
        constraint = borrower_token.owner == borrower.key()
    )]
    pub borrower_token: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = vault_token.mint == loan.collateral_mint,
        constraint = vault_token.owner == vault.key()
    )]
    pub vault_token: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<DepositCollateral>) -> Result<()> {
    let loan = &mut ctx.accounts.loan;
    let vault = &mut ctx.accounts.vault;
    
    // Transfer NFT from borrower to vault
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.borrower_token.to_account_info(),
            to: ctx.accounts.vault_token.to_account_info(),
            authority: ctx.accounts.borrower.to_account_info(),
        },
    );
    
    anchor_spl::token::transfer(transfer_ctx, 1)?; // NFTs have amount 1
    
    emit!(CollateralDeposited {
        loan: loan.key(),
        collateral_mint: loan.collateral_mint,
        amount: 1,
    });
    
    Ok(())
}
