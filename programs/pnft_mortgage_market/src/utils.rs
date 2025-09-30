
pub fn calculate_health_ratio(collateral_value: u64, loan_amount: u64) -> u64 {
    if loan_amount == 0 {
        return 0;
    }
    (collateral_value * 10000) / loan_amount
}

pub fn is_healthy_ratio(health_ratio: u64, threshold: u64) -> bool {
    health_ratio >= threshold
}

pub fn calculate_liquidation_price(loan_amount: u64, collateral_amount: u64, threshold: u64) -> u64 {
    if collateral_amount == 0 {
        return 0;
    }
    (loan_amount * threshold) / (collateral_amount * 10000)
}
