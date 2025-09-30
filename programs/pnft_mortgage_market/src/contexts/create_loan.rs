use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Mint};

use crate::states::*;
use crate::events::*;

#[derive(Accounts)]
#[instruction(loan_amount: u64, duration: i64, interest_rate: u16)]
pub struct CreateLoan<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,
    
    #[account(mut)]
    pub lender: Signer<'info>,
    
    // pNFT accounts
    pub collateral_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        constraint = collateral_token.mint == collateral_mint.key(),
        constraint = collateral_token.owner == borrower.key()
    )]
    pub collateral_token: Account<'info, TokenAccount>,
    
    // Loan PDA
    #[account(
        init,
        payer = borrower,
        space = 8 + Loan::LEN,
        seeds = [
            b"loan",
            borrower.key().as_ref(),
            collateral_mint.key().as_ref()
        ],
        bump
    )]
    pub loan: Account<'info, Loan>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateLoan>,
    loan_amount: u64,
    duration: i64,
    interest_rate: u16,
) -> Result<()> {
    let loan = &mut ctx.accounts.loan;
    let clock = Clock::get()?;

    // Initialize loan account
    loan.borrower = ctx.accounts.borrower.key();
    loan.lender = ctx.accounts.lender.key();
    loan.collateral_mint = ctx.accounts.collateral_mint.key();
    loan.loan_amount = loan_amount;
    loan.outstanding_amount = loan_amount;
    loan.interest_rate = interest_rate;
    loan.duration = duration;
    loan.start_time = clock.unix_timestamp;
    loan.status = LoanStatus::Active;
    loan.liquidation_threshold = 8000; // 80% LTV
    loan.bump = ctx.bumps.loan;

    emit!(LoanCreated {
        loan: loan.key(),
        borrower: loan.borrower,
        lender: loan.lender,
        collateral_mint: loan.collateral_mint,
        amount: loan_amount,
        duration,
        interest_rate,
    });

    Ok(())
}
