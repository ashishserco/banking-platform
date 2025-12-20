import { apiClient } from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import {
    Payment,
    ProcessPaymentRequest,
    Beneficiary,
    CreateBeneficiaryRequest,
    ScheduledPayment,
} from '@/types/payment.types';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types';

/**
 * Payment Service
 * Handles payment processing and beneficiary management
 */
export const paymentService = {
    /**
     * Get all payments
     */
    async getPayments(pagination?: PaginationParams): Promise<PaginatedResponse<Payment>> {
        const response = await apiClient.get<PaginatedResponse<Payment>>(
            API_ENDPOINTS.PAYMENTS.BASE,
            {
                params: pagination,
            }
        );
        return response.data;
    },

    /**
     * Get payment by ID
     */
    async getPaymentById(paymentId: string): Promise<Payment> {
        const response = await apiClient.get<ApiResponse<Payment>>(
            API_ENDPOINTS.PAYMENTS.BY_ID(paymentId)
        );
        return response.data.data;
    },

    /**
     * Process payment
     */
    async processPayment(request: ProcessPaymentRequest): Promise<Payment> {
        const response = await apiClient.post<ApiResponse<Payment>>(
            API_ENDPOINTS.PAYMENTS.PROCESS,
            request
        );
        return response.data.data;
    },

    /**
     * Get scheduled payments
     */
    async getScheduledPayments(): Promise<ScheduledPayment[]> {
        const response = await apiClient.get<ApiResponse<ScheduledPayment[]>>(
            API_ENDPOINTS.PAYMENTS.SCHEDULED
        );
        return response.data.data;
    },

    /**
     * Get all beneficiaries
     */
    async getBeneficiaries(): Promise<Beneficiary[]> {
        const response = await apiClient.get<ApiResponse<Beneficiary[]>>(
            API_ENDPOINTS.BENEFICIARIES.BASE
        );
        return response.data.data;
    },

    /**
     * Get beneficiary by ID
     */
    async getBeneficiaryById(beneficiaryId: string): Promise<Beneficiary> {
        const response = await apiClient.get<ApiResponse<Beneficiary>>(
            API_ENDPOINTS.BENEFICIARIES.BY_ID(beneficiaryId)
        );
        return response.data.data;
    },

    /**
     * Create beneficiary
     */
    async createBeneficiary(request: CreateBeneficiaryRequest): Promise<Beneficiary> {
        const response = await apiClient.post<ApiResponse<Beneficiary>>(
            API_ENDPOINTS.BENEFICIARIES.BASE,
            request
        );
        return response.data.data;
    },

    /**
     * Update beneficiary
     */
    async updateBeneficiary(
        beneficiaryId: string,
        request: Partial<CreateBeneficiaryRequest>
    ): Promise<Beneficiary> {
        const response = await apiClient.put<ApiResponse<Beneficiary>>(
            API_ENDPOINTS.BENEFICIARIES.BY_ID(beneficiaryId),
            request
        );
        return response.data.data;
    },

    /**
     * Delete beneficiary
     */
    async deleteBeneficiary(beneficiaryId: string): Promise<void> {
        await apiClient.delete(API_ENDPOINTS.BENEFICIARIES.BY_ID(beneficiaryId));
    },
};
