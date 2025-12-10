
export type Role = 'user' | 'admin';
export type KYCStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  referralCode: string;
  referredBy?: string;
  joinedAt: string;
  isBlocked: boolean;
  kycStatus: KYCStatus;
  kycData?: string; // URL to proof
  phone?: string;
}

export interface Wallet {
  userId: string;
  balanceINR: number; // The primary currency
  totalProfit: number;
  totalPartnershipBonus: number;
}

export type TransactionStatus = 'pending' | 'approved' | 'rejected';
export type TransactionType = 'deposit' | 'withdrawal';
export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'USDT' | 'CBDC';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // Always in INR
  method: PaymentMethod;
  status: TransactionStatus;
  date: string;
  proofUrl?: string; // For deposits
  txHash?: string;   // For deposits (UTR or TxHash)
  walletAddress?: string; // For withdrawals
}

export type RiskLevel = 'Low' | 'Medium' | 'High';
export type Region = 'India' | 'Global';

export interface ProjectPlan {
  id: string;
  name: string;
  ticker: string; // e.g. TATA, RELIANCE
  amount: number; // Min Investment in INR
  durationWeeks: number;
  description: string;
  isActive: boolean;
  targetGrowth?: string;
  feePercentage: number; 
  risk: RiskLevel;
  region: Region;
}

export interface InvestmentContract {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  planTicker: string;
  investedAmount: number;
  startDate: string;
  endDate: string;
  currentProfit: number;
  status: 'active' | 'completed';
  lastGrowthUpdate?: string;
}

export interface GrowthLog {
  id: string;
  tradeId: string;
  userId: string;
  date: string;
  percentage: number;
  profitAdded: number;
}

export interface Notification {
  id: string;
  userId?: string; 
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetId?: string;
  details: string;
  date: string;
}
