import { apiClient } from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import { Notification, NotificationPreferences } from '@/types/notification.types';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types';

/**
 * Notification Service
 * Handles notifications and preferences
 */
export const notificationService = {
    /**
     * Get all notifications
     */
    async getNotifications(pagination?: PaginationParams): Promise<PaginatedResponse<Notification>> {
        const response = await apiClient.get<PaginatedResponse<Notification>>(
            API_ENDPOINTS.NOTIFICATIONS.BASE,
            {
                params: pagination,
            }
        );
        return response.data;
    },

    /**
     * Get notification by ID
     */
    async getNotificationById(notificationId: string): Promise<Notification> {
        const response = await apiClient.get<ApiResponse<Notification>>(
            API_ENDPOINTS.NOTIFICATIONS.BY_ID(notificationId)
        );
        return response.data.data;
    },

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
    },

    /**
     * Get notification preferences
     */
    async getPreferences(): Promise<NotificationPreferences> {
        const response = await apiClient.get<ApiResponse<NotificationPreferences>>(
            API_ENDPOINTS.NOTIFICATIONS.PREFERENCES
        );
        return response.data.data;
    },

    /**
     * Update notification preferences
     */
    async updatePreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
        const response = await apiClient.put<ApiResponse<NotificationPreferences>>(
            API_ENDPOINTS.NOTIFICATIONS.PREFERENCES,
            preferences
        );
        return response.data.data;
    },

    /**
     * Get unread count
     */
    async getUnreadCount(): Promise<number> {
        const response = await apiClient.get<ApiResponse<{ count: number }>>(
            `${API_ENDPOINTS.NOTIFICATIONS.BASE}/unread-count`
        );
        return response.data.data.count;
    },
};
