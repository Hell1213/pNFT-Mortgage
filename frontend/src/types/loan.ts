export enum LoanStatus {
  Active = "active",
  Repaid = "repaid",
  Liquidated = "liquidated",
}

export interface Loan {
  id: string;
  borrower: string;
  lender: string;
  collateralMint: string;
  loanAmount: number;
  outstandingAmount: number;
  interestRate: number;
  duration: number;
  liquidationThreshold: number;
  status: LoanStatus;
  createdAt: string;
  healthRatio: number;
  collateralValue: number;
}
