use anchor_lang::prelude::*;

declare_id!("H6UnYU1JKVzkRLf61Ew6jEU8UerFbeJ38iPyVvrjWE9Z");

#[program]
pub mod pnft_mortgage_market {
    use super::*;

    // Initialize the protocol
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
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

    // Create a new loan using NFT as collateral
    pub fn create_loan(
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

        Ok(())
    }
}

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

#[derive(Accounts)]
#[instruction(loan_amount: u64, duration: i64, interest_rate: u16)]
pub struct CreateLoan<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,
    
    #[account(mut)]
    pub lender: Signer<'info>,
    
    // NFT mint
    /// CHECK: We're just storing the mint address
    pub collateral_mint: UncheckedAccount<'info>,
    
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

#[account]
pub struct Loan {
    pub borrower: Pubkey,           // 32 bytes
    pub lender: Pubkey,             // 32 bytes
    pub collateral_mint: Pubkey,    // 32 bytes - NFT mint
    pub loan_amount: u64,           // 8 bytes
    pub outstanding_amount: u64,    // 8 bytes - principal + interest
    pub interest_rate: u16,         // 2 bytes - basis points
    pub duration: i64,              // 8 bytes - loan term in seconds
    pub start_time: i64,            // 8 bytes - unix timestamp
    pub status: LoanStatus,         // 1 byte
    pub liquidation_threshold: u16, // 2 bytes - percentage
    pub bump: u8,                   // 1 byte - PDA bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum LoanStatus {
    Active,
    Repaid,
    Liquidated,
    InAuction,
}

impl Loan {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 8 + 2 + 8 + 8 + 1 + 2 + 1;
}