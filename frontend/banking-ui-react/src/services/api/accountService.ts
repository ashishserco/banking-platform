import { apiClient } from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import { Account, Balance, CreateAccountRequest } from '@/types/account.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { Transaction } from '@/types/transaction.types';

/**
 * Account Service
 * Handles account management operations
 */
export const accountService = {
    /**
     * Get all accounts for current user
     */
    async getAccounts(): Promise<Account[]> {
        const response = await apiClient.get<ApiResponse<Account[]>>(API_ENDPOINTS.ACCOUNTS.BASE);
        return response.data.data;
    },

    /**
     * Get account by ID
     */
    async getAccountById(accountId: string): Promise<Account> {
        const response = await apiClient.get<ApiResponse<Account>>(
            API_ENDPOINTS.ACCOUNTS.BY_ID(accountId)
        );
        return response.data.data;
    },

    /**
     * Get account balance
     */
    async getBalance(accountNumber: string): Promise<Balance> {
        const response = await apiClient.get<ApiResponse<Balance>>(
            API_ENDPOINTS.ACCOUNTS.BALANCE(accountNumber)
        );
        return response.data.data;
    },

    /**
     * Get account transactions
     */
    async getAccountTransactions(
        accountNumber: string,
        pageNumber: number = 1,
        pageSize: number = 20
    ): Promise<PaginatedResponse<Transaction>> {
        const response = await apiClient.get<PaginatedResponse<Transaction>>(
            API_ENDPOINTS.ACCOUNTS.TRANSACTIONS(accountNumber),
            {
                params: { pageNumber, pageSize },
            }
        );
        return response.data;
    },

    /**
     * Create new account
     */
    async createAccount(request: CreateAccountRequest): Promise<Account> {
        const response = await apiClient.post<ApiResponse<Account>>(
            API_ENDPOINTS.ACCOUNTS.BASE,
            request
        );
        return response.data.data;
    },
};
