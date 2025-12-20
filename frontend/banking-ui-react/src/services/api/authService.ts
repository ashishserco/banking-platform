import { apiClient } from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import { LoginRequest, LoginResponse, User } from '@/types/auth.types';
import { ApiResponse } from '@/types/api.types';

/**
 * Authentication Service
 * Handles login, logout, and user authentication
 */
export const authService = {
    /**
     * Login user
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await apiClient.post<ApiResponse<LoginResponse>>(
            API_ENDPOINTS.AUTH.LOGIN,
            credentials
        );
        return response.data.data;
    },

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    },

    /**
     * Get current user
     */
    async getCurrentUser(): Promise<User> {
        const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
        return response.data.data;
    },

    /**
     * Refresh auth token
     */
    async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
        const response = await apiClient.post<ApiResponse<{ token: string; refreshToken: string }>>(
            API_ENDPOINTS.AUTH.REFRESH,
            { refreshToken }
        );
        return response.data.data;
    },
};
