import { apiClient } from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import { DashboardStats } from '@/types';
import { ApiResponse } from '@/types/api.types';

/**
 * Dashboard Service
 * Handles dashboard statistics and data
 */
export const dashboardService = {
    /**
     * Get dashboard statistics
     */
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await apiClient.get<ApiResponse<DashboardStats>>(
            API_ENDPOINTS.DASHBOARD.STATS
        );
        return response.data.data;
    },
};
