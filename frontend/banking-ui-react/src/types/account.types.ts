// Account Types
export interface Account {
    accountId: string;
    accountNumber: string;
    customerId: string;
    accountType: AccountType;
    balance: number;
    currency: string;
    status: AccountStatus;
    createdAt: string;
    updatedAt: string;
    customer?: Customer;
}

export type AccountType = 'SAVINGS' | 'CURRENT' | 'LOAN';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'CLOSED';

export interface Customer {
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth: string;
    kycStatus: KycStatus;
    createdAt: string;
}

export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface Balance {
    accountNumber: string;
    availableBalance: number;
    pendingBalance: number;
    currency: string;
    lastUpdated: string;
}

export interface CreateAccountRequest {
    customerId: string;
    accountType: AccountType;
    initialDeposit: number;
    currency: string;
}

export interface CreateCustomerRequest {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth: string;
}
