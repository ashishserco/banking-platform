// Common types used across the application

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pageSize: number;
  pageNumber: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Account types
export interface Account {
  accountId: string;
  accountNumber: string;
  customerId: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'LOAN';
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
}

export interface Customer {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
}

export interface Balance {
  accountNumber: string;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  lastUpdated: string;
}

// Transaction types
export interface Transaction {
  transactionId: string;
  idempotencyKey: string;
  fromAccountNumber?: string;
  toAccountNumber?: string;
  amount: number;
  currency: string;
  transactionType: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description?: string;
  referenceNumber?: string;
  correlationId?: string;
  createdAt: string;
  processedAt?: string;
  completedAt?: string;
  failureReason?: string;
  transactionEntries: TransactionEntry[];
}

export interface TransactionEntry {
  entryId: string;
  accountNumber: string;
  entryType: 'DEBIT' | 'CREDIT';
  amount: number;
  description?: string;
  createdAt: string;
}

// Payment types
export interface Payment {
  paymentId: string;
  idempotencyKey: string;
  sourceAccountNumber: string;
  paymentType: 'BILL_PAYMENT' | 'MERCHANT_PAYMENT' | 'MOBILE_RECHARGE' | 'INVESTMENT';
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
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
}

export interface Beneficiary {
  beneficiaryId: string;
  name: string;
  beneficiaryType: 'INDIVIDUAL' | 'MERCHANT' | 'UTILITY' | 'TELECOM';
  accountNumber?: string;
  bankCode?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  isActive: boolean;
}

// Notification types
export interface Notification {
  notificationId: string;
  notificationType: 'EMAIL' | 'SMS' | 'PUSH';
  eventType: string;
  recipient: string;
  subject: string;
  content: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'RETRYING';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  attemptCount: number;
  maxAttempts: number;
  createdAt: string;
  sentAt?: string;
  nextRetryAt?: string;
  failureReason?: string;
  correlationId?: string;
  externalMessageId?: string;
  externalProvider?: string;
}

// Form types
export interface CreateAccountRequest {
  customerId: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'LOAN';
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

export interface ProcessPaymentRequest {
  idempotencyKey: string;
  sourceAccountNumber: string;
  beneficiaryId: string;
  paymentType: 'BILL_PAYMENT' | 'MERCHANT_PAYMENT' | 'MOBILE_RECHARGE' | 'INVESTMENT';
  amount: number;
  currency: string;
  description?: string;
  correlationId?: string;
  paymentDetails?: Record<string, string>;
}

export interface CreateBeneficiaryRequest {
  name: string;
  beneficiaryType: 'INDIVIDUAL' | 'MERCHANT' | 'UTILITY' | 'TELECOM';
  accountNumber?: string;
  bankCode?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
}

// Dashboard types
export interface DashboardStats {
  totalAccounts: number;
  totalBalance: number;
  monthlyTransactions: number;
  pendingPayments: number;
  recentTransactions: Transaction[];
  accountSummary: AccountSummary[];
}

export interface AccountSummary {
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  status: string;
}