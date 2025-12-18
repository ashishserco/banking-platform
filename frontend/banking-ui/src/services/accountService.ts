import { apiClient } from './apiClient';
import { 
  Account, 
  Balance, 
  Customer, 
  CreateAccountRequest, 
  CreateCustomerRequest,
  ApiResponse 
} from '../types';

export const accountService = {
  // Account operations
  async createAccount(data: CreateAccountRequest): Promise<ApiResponse<Account>> {
    const response = await apiClient.post<ApiResponse<Account>>('/account', data);
    return response.data;
  },

  async getAccount(accountId: string): Promise<ApiResponse<Account>> {
    const response = await apiClient.get<ApiResponse<Account>>(`/account/${accountId}`);
    return response.data;
  },

  async getAccountByNumber(accountNumber: string): Promise<ApiResponse<Account>> {
    const response = await apiClient.get<ApiResponse<Account>>(`/account/number/${accountNumber}`);
    return response.data;
  },

  async getAccountBalance(accountNumber: string): Promise<ApiResponse<Balance>> {
    const response = await apiClient.get<ApiResponse<Balance>>(`/account/balance/${accountNumber}`);
    return response.data;
  },

  async getAccountsByCustomer(customerId: string): Promise<ApiResponse<Account[]>> {
    const response = await apiClient.get<ApiResponse<Account[]>>(`/account/customer/${customerId}`);
    return response.data;
  },

  async updateAccountStatus(accountNumber: string, status: string): Promise<ApiResponse<void>> {
    const response = await apiClient.patch<ApiResponse<void>>(`/account/${accountNumber}/status`, { status });
    return response.data;
  },

  // Customer operations
  async createCustomer(data: CreateCustomerRequest): Promise<ApiResponse<Customer>> {
    const response = await apiClient.post<ApiResponse<Customer>>('/customer', data);
    return response.data;
  },

  async getCustomer(customerId: string): Promise<ApiResponse<Customer>> {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customer/${customerId}`);
    return response.data;
  },

  async getCustomerByEmail(email: string): Promise<ApiResponse<Customer>> {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customer/email/${email}`);
    return response.data;
  },

  async updateKycStatus(customerId: string, kycStatus: string): Promise<ApiResponse<void>> {
    const response = await apiClient.patch<ApiResponse<void>>(`/customer/${customerId}/kyc-status`, { kycStatus });
    return response.data;
  }
};