// Application Constants
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Enterprise Banking Portal';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
    },
    // Accounts
    ACCOUNTS: {
        BASE: '/accounts',
        BY_ID: (id: string) => `/accounts/${id}`,
        BALANCE: (accountNumber: string) => `/accounts/${accountNumber}/balance`,
        TRANSACTIONS: (accountNumber: string) => `/accounts/${accountNumber}/transactions`,
    },
    // Transactions
    TRANSACTIONS: {
        BASE: '/transactions',
        BY_ID: (id: string) => `/transactions/${id}`,
        TRANSFER: '/transactions/transfer',
        DEPOSIT: '/transactions/deposit',
        WITHDRAW: '/transactions/withdraw',
    },
    // Payments
    PAYMENTS: {
        BASE: '/payments',
        BY_ID: (id: string) => `/payments/${id}`,
        PROCESS: '/payments/process',
        SCHEDULED: '/payments/scheduled',
    },
    // Beneficiaries
    BENEFICIARIES: {
        BASE: '/beneficiaries',
        BY_ID: (id: string) => `/beneficiaries/${id}`,
    },
    // Notifications
    NOTIFICATIONS: {
        BASE: '/notifications',
        BY_ID: (id: string) => `/notifications/${id}`,
        MARK_READ: (id: string) => `/notifications/${id}/read`,
        PREFERENCES: '/notifications/preferences',
    },
    // Support
    SUPPORT: {
        TICKETS: '/support/tickets',
        TICKET_BY_ID: (id: string) => `/support/tickets/${id}`,
        MESSAGES: (ticketId: string) => `/support/tickets/${ticketId}/messages`,
    },
    // Dashboard
    DASHBOARD: {
        STATS: '/dashboard/stats',
    },
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date Formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATE_TIME_FORMAT = 'MMM dd, yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm:ss';

// Currency
export const DEFAULT_CURRENCY = 'USD';
export const CURRENCY_SYMBOL: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
};

// Request Timeouts
export const REQUEST_TIMEOUT = 30000; // 30 seconds
export const LONG_REQUEST_TIMEOUT = 60000; // 60 seconds

// Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
    THEME: 'theme',
};

// Query Keys for React Query
export const QUERY_KEYS = {
    ACCOUNTS: 'accounts',
    ACCOUNT_DETAILS: 'account-details',
    TRANSACTIONS: 'transactions',
    PAYMENTS: 'payments',
    BENEFICIARIES: 'beneficiaries',
    NOTIFICATIONS: 'notifications',
    SUPPORT_TICKETS: 'support-tickets',
    DASHBOARD_STATS: 'dashboard-stats',
    USER: 'user',
};

// Status Colors
export const STATUS_COLORS = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    PENDING: 'warning',
    PROCESSING: 'info',
    COMPLETED: 'success',
    FAILED: 'error',
    CANCELLED: 'default',
    FROZEN: 'warning',
    CLOSED: 'default',
} as const;

// Transaction Type Labels
export const TRANSACTION_TYPE_LABELS = {
    TRANSFER: 'Transfer',
    DEPOSIT: 'Deposit',
    WITHDRAWAL: 'Withdrawal',
    PAYMENT: 'Payment',
};

// Payment Type Labels
export const PAYMENT_TYPE_LABELS = {
    BILL_PAYMENT: 'Bill Payment',
    MERCHANT_PAYMENT: 'Merchant Payment',
    MOBILE_RECHARGE: 'Mobile Recharge',
    INVESTMENT: 'Investment',
};
