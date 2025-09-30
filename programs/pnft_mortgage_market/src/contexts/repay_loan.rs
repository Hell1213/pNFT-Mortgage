use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer};

use crate::states::*;
use crate::events::*;

#[derive(Accounts)]
pub struct RepayLoan<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,
    
    #[account(mut)]
    pub lender: Signer<'info>,
    
    #[account(
        mut,
        constraint = loan.borrower == borrower.key(),
        constraint = loan.lender == lender.key(),
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
    
    // USDC token accounts for repayment
    #[account(
        mut,
        constraint = borrower_usdc.owner == borrower.key()
    )]
    pub borrower_usdc: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = lender_usdc.owner == lender.key()
    )]
    pub lender_usdc: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<RepayLoan>) -> Result<()> {
    let loan = &mut ctx.accounts.loan;
    let clock = Clock::get()?;
    
    // Calculate total repayment amount (principal + interest)
    let interest = loan.calculate_interest(clock.unix_timestamp);
    let total_repayment = loan.loan_amount + interest;
    
    // Transfer USDC from borrower to lender
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.borrower_usdc.to_account_info(),
            to: ctx.accounts.lender_usdc.to_account_info(),
            authority: ctx.accounts.borrower.to_account_info(),
        },
    );
    
    anchor_spl::token::transfer(transfer_ctx, total_repayment)?;
    
    // Transfer NFT back to borrower
    let transfer_nft_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_token.to_account_info(),
            to: ctx.accounts.borrower_token.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        },
    );
    
    anchor_spl::token::transfer(transfer_nft_ctx, 1)?;
    
    // Update loan status
    loan.status = LoanStatus::Repaid;
    loan.outstanding_amount = 0;
    
    emit!(LoanRepaid {
        loan: loan.key(),
        borrower: loan.borrower,
        amount: total_repayment,
    });
    
    Ok(())
}
