// Payment Types
export interface Payment {
    paymentId: string;
    idempotencyKey: string;
    sourceAccountNumber: string;
    paymentType: PaymentType;
    amount: number;
    currency: string;
    status: PaymentStatus;
    description?: string;
    referenceNumber?: string;
    correlationId?: string;
    createdAt: string;
    processedAt?: string;
    completedAt?: string;
    failureReason?: string;
    externalTransactionId?: string;
    externalGateway?: string;
    beneficiary?: Beneficiary;
    beneficiaryId?: string;
}

export type PaymentType = 'BILL_PAYMENT' | 'MERCHANT_PAYMENT' | 'MOBILE_RECHARGE' | 'INVESTMENT';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Beneficiary {
    beneficiaryId: string;
    customerId: string;
    name: string;
    beneficiaryType: BeneficiaryType;
    accountNumber?: string;
    bankCode?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    status: BeneficiaryStatus;
    createdAt: string;
    isActive: boolean;
}

export type BeneficiaryType = 'INDIVIDUAL' | 'MERCHANT' | 'UTILITY' | 'TELECOM';
export type BeneficiaryStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProcessPaymentRequest {
    idempotencyKey: string;
    sourceAccountNumber: string;
    beneficiaryId: string;
    paymentType: PaymentType;
    amount: number;
    currency: string;
    description?: string;
    correlationId?: string;
    paymentDetails?: Record<string, string>;
}

export interface CreateBeneficiaryRequest {
    name: string;
    beneficiaryType: BeneficiaryType;
    accountNumber?: string;
    bankCode?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
}

export interface ScheduledPayment {
    scheduledPaymentId: string;
    sourceAccountNumber: string;
    beneficiaryId: string;
    amount: number;
    currency: string;
    frequency: PaymentFrequency;
    nextExecutionDate: string;
    status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
    createdAt: string;
}

export type PaymentFrequency = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
