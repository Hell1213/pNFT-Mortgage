use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

use crate::states::*;
use crate::errors::*;
use crate::events::*;

#[derive(Accounts)]
pub struct LiquidateLoan<'info> {
    #[account(mut)]
    pub liquidator: Signer<'info>,
    
    #[account(
        mut,
        constraint = loan.status == LoanStatus::Active
    )]
    pub loan: Account<'info, Loan>,
    
    #[account(
        mut,
        constraint = vault.loan == loan.key()
    )]
    pub vault: Account<'info, Vault>,
    
    // Auction PDA
    #[account(
        init,
        payer = liquidator,
        space = 8 + Auction::LEN,
        seeds = [
            b"auction",
            loan.key().as_ref()
        ],
        bump
    )]
    pub auction: Account<'info, Auction>,
    
    #[account(
        mut,
        constraint = vault_token.mint == loan.collateral_mint,
        constraint = vault_token.owner == vault.key()
    )]
    pub vault_token: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<LiquidateLoan>) -> Result<()> {
    let loan = &mut ctx.accounts.loan;
    let auction = &mut ctx.accounts.auction;
    let clock = Clock::get()?;
    
    // Check if loan is liquidatable
    // For demo purposes, we'll use a mock collateral value
    // In production, this would come from oracle
    let mock_collateral_value = 1000 * 1_000_000; // 1000 USDC
    
    require!(
        loan.is_liquidatable(clock.unix_timestamp, mock_collateral_value),
        LoanError::NotLiquidatable
    );
    
    // Initialize auction
    auction.loan = loan.key();
    auction.collateral_mint = loan.collateral_mint;
    auction.starting_price = loan.outstanding_amount / 2; // Start at 50% of loan value
    auction.current_bid = 0;
    auction.current_bidder = Pubkey::default();
    auction.end_time = clock.unix_timestamp + 24 * 3600; // 24 hours
    auction.status = AuctionStatus::Active;
    auction.bump = ctx.bumps.auction;
    
    // Update loan status
    loan.status = LoanStatus::InAuction;
    
    emit!(LoanLiquidated {
        loan: loan.key(),
        liquidator: ctx.accounts.liquidator.key(),
        collateral_mint: loan.collateral_mint,
    });
    
    emit!(AuctionStarted {
        loan: loan.key(),
        collateral_mint: loan.collateral_mint,
        starting_price: auction.starting_price,
        end_time: auction.end_time,
    });
    
    Ok(())
}
