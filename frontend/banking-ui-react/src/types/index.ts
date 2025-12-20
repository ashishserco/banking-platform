import { Transaction } from './transaction.types';

// Dashboard Types
export interface DashboardStats {
    totalBalance: number;
    totalAccounts: number;
    monthlyTransactions: number;
    pendingPayments: number;
    recentTransactions: Transaction[];
    accountSummary: AccountSummary[];
    balanceTrend: BalanceTrendData[];
}

export interface AccountSummary {
    accountNumber: string;
    accountType: string;
    balance: number;
    currency: string;
    status: string;
}

export interface BalanceTrendData {
    date: string;
    balance: number;
}

// Re-export commonly used types
export type { Account } from './account.types';
export type { Payment } from './payment.types';
export type { Beneficiary } from './payment.types';
export type { Notification } from './notification.types';
export type { SupportTicket } from './support.types';
export type { User } from './auth.types';
