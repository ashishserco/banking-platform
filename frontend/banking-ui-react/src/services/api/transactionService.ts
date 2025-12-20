import { apiClient } from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import {
    Transaction,
    TransferMoneyRequest,
    DepositMoneyRequest,
    WithdrawMoneyRequest,
    TransactionFilters,
} from '@/types/transaction.types';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types';

/**
 * Transaction Service
 * Handles transaction operations and history
 */
export const transactionService = {
    /**
     * Get all transactions with filters
     */
    async getTransactions(
        filters?: TransactionFilters,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<Transaction>> {
        const response = await apiClient.get<PaginatedResponse<Transaction>>(
            API_ENDPOINTS.TRANSACTIONS.BASE,
            {
                params: {
                    ...filters,
                    ...pagination,
                },
            }
        );
        return response.data;
    },

    /**
     * Get transaction by ID
     */
    async getTransactionById(transactionId: string): Promise<Transaction> {
        const response = await apiClient.get<ApiResponse<Transaction>>(
            API_ENDPOINTS.TRANSACTIONS.BY_ID(transactionId)
        );
        return response.data.data;
    },

    /**
     * Transfer money between accounts
     */
    async transferMoney(request: TransferMoneyRequest): Promise<Transaction> {
        const response = await apiClient.post<ApiResponse<Transaction>>(
            API_ENDPOINTS.TRANSACTIONS.TRANSFER,
            request
        );
        return response.data.data;
    },

    /**
     * Deposit money to account
     */
    async depositMoney(request: DepositMoneyRequest): Promise<Transaction> {
        const response = await apiClient.post<ApiResponse<Transaction>>(
            API_ENDPOINTS.TRANSACTIONS.DEPOSIT,
            request
        );
        return response.data.data;
    },

    /**
     * Withdraw money from account
     */
    async withdrawMoney(request: WithdrawMoneyRequest): Promise<Transaction> {
        const response = await apiClient.post<ApiResponse<Transaction>>(
            API_ENDPOINTS.TRANSACTIONS.WITHDRAW,
            request
        );
        return response.data.data;
    },
};
