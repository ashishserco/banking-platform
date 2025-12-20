// Transaction Types
export interface Transaction {
    transactionId: string;
    idempotencyKey: string;
    fromAccountNumber?: string;
    toAccountNumber?: string;
    amount: number;
    currency: string;
    transactionType: TransactionType;
    status: TransactionStatus;
    description?: string;
    referenceNumber?: string;
    correlationId?: string;
    createdAt: string;
    processedAt?: string;
    completedAt?: string;
    failureReason?: string;
    transactionEntries: TransactionEntry[];
}

export type TransactionType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT';
export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface TransactionEntry {
    entryId: string;
    accountNumber: string;
    entryType: 'DEBIT' | 'CREDIT';
    amount: number;
    description?: string;
    createdAt: string;
}

export interface TransferMoneyRequest {
    idempotencyKey: string;
    fromAccountNumber: string;
    toAccountNumber: string;
    amount: number;
    currency: string;
    description?: string;
    correlationId?: string;
}

export interface DepositMoneyRequest {
    idempotencyKey: string;
    accountNumber: string;
    amount: number;
    currency: string;
    description?: string;
    referenceNumber?: string;
}

export interface WithdrawMoneyRequest {
    idempotencyKey: string;
    accountNumber: string;
    amount: number;
    currency: string;
    description?: string;
    referenceNumber?: string;
}

export interface TransactionFilters {
    accountNumber?: string;
    transactionType?: TransactionType;
    status?: TransactionStatus;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    searchTerm?: string;
}
