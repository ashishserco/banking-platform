import { apiClient } from './apiClient';
import { 
  Payment, 
  Beneficiary,
  ProcessPaymentRequest,
  CreateBeneficiaryRequest,
  PaginatedResponse,
  ApiResponse 
} from '../types';

export interface PaymentSearchRequest {
  sourceAccountNumber?: string;
  paymentType?: string;
  status?: string;
  beneficiaryId?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  pageSize?: number;
  pageNumber?: number;
}

export interface BillPaymentRequest {
  idempotencyKey: string;
  sourceAccountNumber: string;
  billerId: string;
  billNumber: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface MobileRechargeRequest {
  idempotencyKey: string;
  sourceAccountNumber: string;
  mobileNumber: string;
  operator: string;
  amount: number;
  currency: string;
}

export const paymentService = {
  // Payment operations
  async processPayment(data: ProcessPaymentRequest): Promise<ApiResponse<Payment>> {
    const response = await apiClient.post<ApiResponse<Payment>>('/payment/process', data);
    return response.data;
  },

  async processBillPayment(data: BillPaymentRequest): Promise<ApiResponse<Payment>> {
    const response = await apiClient.post<ApiResponse<Payment>>('/payment/bill', data);
    return response.data;
  },

  async processMobileRecharge(data: MobileRechargeRequest): Promise<ApiResponse<Payment>> {
    const response = await apiClient.post<ApiResponse<Payment>>('/payment/mobile-recharge', data);
    return response.data;
  },

  async getPayment(paymentId: string): Promise<ApiResponse<Payment>> {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payment/${paymentId}`);
    return response.data;
  },

  async getPaymentByIdempotencyKey(idempotencyKey: string): Promise<ApiResponse<Payment>> {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payment/idempotency/${idempotencyKey}`);
    return response.data;
  },

  async searchPayments(params: PaymentSearchRequest): Promise<PaginatedResponse<Payment>> {
    const response = await apiClient.post<PaginatedResponse<Payment>>('/payment/search', params);
    return response.data;
  },

  async getAccountPayments(
    accountNumber: string, 
    pageSize: number = 50, 
    pageNumber: number = 1
  ): Promise<PaginatedResponse<Payment>> {
    const response = await apiClient.get<PaginatedResponse<Payment>>(
      `/payment/account/${accountNumber}?pageSize=${pageSize}&pageNumber=${pageNumber}`
    );
    return response.data;
  },

  async cancelPayment(paymentId: string, reason: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(`/payment/${paymentId}/cancel`, { reason });
    return response.data;
  },

  async refundPayment(paymentId: string, reason: string): Promise<ApiResponse<Payment>> {
    const response = await apiClient.post<ApiResponse<Payment>>(`/payment/${paymentId}/refund`, { reason });
    return response.data;
  },

  // Beneficiary operations
  async createBeneficiary(data: CreateBeneficiaryRequest): Promise<ApiResponse<Beneficiary>> {
    const response = await apiClient.post<ApiResponse<Beneficiary>>('/beneficiary', data);
    return response.data;
  },

  async getBeneficiary(beneficiaryId: string): Promise<ApiResponse<Beneficiary>> {
    const response = await apiClient.get<ApiResponse<Beneficiary>>(`/beneficiary/${beneficiaryId}`);
    return response.data;
  },

  async getBeneficiaries(beneficiaryType?: string): Promise<ApiResponse<Beneficiary[]>> {
    const url = beneficiaryType ? `/beneficiary?beneficiaryType=${beneficiaryType}` : '/beneficiary';
    const response = await apiClient.get<ApiResponse<Beneficiary[]>>(url);
    return response.data;
  },

  async updateBeneficiaryStatus(beneficiaryId: string, isActive: boolean): Promise<ApiResponse<void>> {
    const response = await apiClient.patch<ApiResponse<void>>(`/beneficiary/${beneficiaryId}/status`, { isActive });
    return response.data;
  },

  async deleteBeneficiary(beneficiaryId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/beneficiary/${beneficiaryId}`);
    return response.data;
  }
};