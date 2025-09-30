use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer};

use crate::states::*;
use crate::errors::*;
use crate::events::*;

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,
    
    #[account(
        mut,
        constraint = auction.status == AuctionStatus::Active
    )]
    pub auction: Account<'info, Auction>,
    
    #[account(
        mut,
        constraint = loan.key() == auction.loan
    )]
    pub loan: Account<'info, Loan>,
    
    // USDC token accounts
    #[account(
        mut,
        constraint = bidder_usdc.owner == bidder.key()
    )]
    pub bidder_usdc: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = treasury_usdc.owner == treasury.key()
    )]
    pub treasury_usdc: Account<'info, TokenAccount>,
    
    /// CHECK: Treasury account
    #[account(mut)]
    pub treasury: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
}

pub fn place_bid_handler(ctx: Context<PlaceBid>, bid_amount: u64) -> Result<()> {
    let auction = &mut ctx.accounts.auction;
    let clock = Clock::get()?;
    
    // Check if auction is still active
    require!(auction.is_active(clock.unix_timestamp), LoanError::AuctionStillActive);
    
    // Check if bid is higher than current bid
    require!(bid_amount > auction.current_bid, LoanError::BidTooLow);
    
    // Transfer USDC from bidder to treasury
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.bidder_usdc.to_account_info(),
            to: ctx.accounts.treasury_usdc.to_account_info(),
            authority: ctx.accounts.bidder.to_account_info(),
        },
    );
    
    anchor_spl::token::transfer(transfer_ctx, bid_amount)?;
    
    // Update auction
    auction.current_bid = bid_amount;
    auction.current_bidder = ctx.accounts.bidder.key();
    
    emit!(BidPlaced {
        auction: auction.key(),
        bidder: ctx.accounts.bidder.key(),
        amount: bid_amount,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct SettleAuction<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,
    
    #[account(
        mut,
        constraint = auction.status == AuctionStatus::Active
    )]
    pub auction: Account<'info, Auction>,
    
    #[account(
        mut,
        constraint = loan.key() == auction.loan
    )]
    pub loan: Account<'info, Loan>,
    
    #[account(
        mut,
        constraint = vault.loan == loan.key()
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(
        mut,
        constraint = vault_token.mint == auction.collateral_mint,
        constraint = vault_token.owner == vault.key()
    )]
    pub vault_token: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = winner_token.mint == auction.collateral_mint,
        constraint = winner_token.owner == auction.current_bidder
    )]
    pub winner_token: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

pub fn settle_handler(ctx: Context<SettleAuction>) -> Result<()> {
    let auction = &mut ctx.accounts.auction;
    let loan = &mut ctx.accounts.loan;
    let clock = Clock::get()?;
    
    // Check if auction has ended
    require!(!auction.is_active(clock.unix_timestamp), LoanError::AuctionStillActive);
    
    // Transfer NFT to winner
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_token.to_account_info(),
            to: ctx.accounts.winner_token.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        },
    );
    
    anchor_spl::token::transfer(transfer_ctx, 1)?;
    
    // Update auction status
    auction.status = AuctionStatus::Settled;
    
    // Update loan status
    loan.status = LoanStatus::Liquidated;
    
    emit!(AuctionSettled {
        auction: auction.key(),
        winner: auction.current_bidder,
        winning_bid: auction.current_bid,
    });
    
    Ok(())
}
