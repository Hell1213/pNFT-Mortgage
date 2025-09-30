use anchor_lang::prelude::*;

#[error_code]
pub enum LoanError {
    #[msg("Asset is not a programmable NFT")]
    NotProgrammableNFT,
    
    #[msg("Loan is not active")]
    LoanNotActive,
    
    #[msg("Loan is not liquidatable")]
    NotLiquidatable,
    
    #[msg("Insufficient collateral value")]
    InsufficientCollateral,
    
    #[msg("Loan has expired")]
    LoanExpired,
    
    #[msg("Invalid oracle price")]
    InvalidOraclePrice,
    
    #[msg("Auction is still active")]
    AuctionStillActive,
    
    #[msg("Bid amount too low")]
    BidTooLow,
    
    #[msg("Unauthorized liquidation attempt")]
    UnauthorizedLiquidation,
    
    #[msg("Invalid interest rate")]
    InvalidInterestRate,
    
    #[msg("Invalid loan duration")]
    InvalidLoanDuration,
    
    #[msg("Insufficient loan amount")]
    InsufficientLoanAmount,
}
