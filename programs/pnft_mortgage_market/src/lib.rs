use anchor_lang::prelude::*;

declare_id!("C2kfwjLdi7uJjfNeE25MYqviPcvSokwpxRyrrhYaGCf6");

pub mod contexts;
pub mod states;
pub mod errors;
pub mod events;
pub mod utils;

use contexts::*;

#[program]
pub mod pnft_mortgage_market {
    use super::*;

    // Initialize the protocol
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        contexts::initialize::handler(ctx)
    }

    // Create a new loan using pNFT as collateral
    pub fn create_loan(
        ctx: Context<CreateLoan>,
        loan_amount: u64,
        duration: i64,
        interest_rate: u16, // basis points
    ) -> Result<()> {
        contexts::create_loan::handler(ctx, loan_amount, duration, interest_rate)
    }

    // Create vault for loan
    pub fn create_vault(ctx: Context<CreateVault>) -> Result<()> {
        contexts::create_vault::handler(ctx)
    }

    // Deposit pNFT collateral into vault
    pub fn deposit_collateral(ctx: Context<DepositCollateral>) -> Result<()> {
        contexts::deposit_collateral::handler(ctx)
    }

    // Repay loan and reclaim collateral
    pub fn repay_loan(ctx: Context<RepayLoan>) -> Result<()> {
        contexts::repay_loan::handler(ctx)
    }

    // Liquidate undercollateralized loan
    pub fn liquidate_loan(ctx: Context<LiquidateLoan>) -> Result<()> {
        contexts::liquidate::handler(ctx)
    }

    // Place bid in liquidation auction
    pub fn place_bid(ctx: Context<PlaceBid>, bid_amount: u64) -> Result<()> {
        contexts::auction::place_bid_handler(ctx, bid_amount)
    }

    // Settle auction and transfer assets
    pub fn settle_auction(ctx: Context<SettleAuction>) -> Result<()> {
        contexts::auction::settle_handler(ctx)
    }
}
