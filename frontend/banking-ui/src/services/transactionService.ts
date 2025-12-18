import { apiClient } from './apiClient';
import { 
  Transaction, 
  TransferMoneyRequest, 
  DepositMoneyRequest, 
  WithdrawMoneyRequest,
  PaginatedResponse,
  ApiResponse 
} from '../types';

export interface TransactionSearchRequest {
  accountNumber?: string;
  status?: string;
  transactionType?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  pageSize?: number;
  pageNumber?: number;
}

export const transactionService = {
  async transferMoney(data: TransferMoneyRequest): Promise<ApiResponse<Transaction>> {
    const response = await apiClient.post<ApiResponse<Transaction>>('/transaction/transfer', data);
    return response.data;
  },

  async depositMoney(data: DepositMoneyRequest): Promise<ApiResponse<Transaction>> {
    const response = await apiClient.post<ApiResponse<Transaction>>('/transaction/deposit', data);
    return response.data;
  },

  async withdrawMoney(data: WithdrawMoneyRequest): Promise<ApiResponse<Transaction>> {
    const response = await apiClient.post<ApiResponse<Transaction>>('/transaction/withdraw', data);
    return response.data;
  },

  async getTransaction(transactionId: string): Promise<ApiResponse<Transaction>> {
    const response = await apiClient.get<ApiResponse<Transaction>>(`/transaction/${transactionId}`);
    return response.data;
  },

  async getTransactionByIdempotencyKey(idempotencyKey: string): Promise<ApiResponse<Transaction>> {
    const response = await apiClient.get<ApiResponse<Transaction>>(`/transaction/idempotency/${idempotencyKey}`);
    return response.data;
  },

  async searchTransactions(params: TransactionSearchRequest): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.post<PaginatedResponse<Transaction>>('/transaction/search', params);
    return response.data;
  },

  async getAccountTransactions(
    accountNumber: string, 
    pageSize: number = 50, 
    pageNumber: number = 1
  ): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.get<PaginatedResponse<Transaction>>(
      `/transaction/account/${accountNumber}?pageSize=${pageSize}&pageNumber=${pageNumber}`
    );
    return response.data;
  },

  async cancelTransaction(transactionId: string, reason: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(`/transaction/${transactionId}/cancel`, { reason });
    return response.data;
  }
};