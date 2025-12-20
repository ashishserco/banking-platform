import { apiClient } from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import {
    SupportTicket,
    CreateTicketRequest,
    AddTicketMessageRequest,
    TicketMessage,
} from '@/types/support.types';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types';

/**
 * Support Service
 * Handles support tickets and messages
 */
export const supportService = {
    /**
     * Get all support tickets
     */
    async getTickets(pagination?: PaginationParams): Promise<PaginatedResponse<SupportTicket>> {
        const response = await apiClient.get<PaginatedResponse<SupportTicket>>(
            API_ENDPOINTS.SUPPORT.TICKETS,
            {
                params: pagination,
            }
        );
        return response.data;
    },

    /**
     * Get ticket by ID
     */
    async getTicketById(ticketId: string): Promise<SupportTicket> {
        const response = await apiClient.get<ApiResponse<SupportTicket>>(
            API_ENDPOINTS.SUPPORT.TICKET_BY_ID(ticketId)
        );
        return response.data.data;
    },

    /**
     * Create support ticket
     */
    async createTicket(request: CreateTicketRequest): Promise<SupportTicket> {
        const response = await apiClient.post<ApiResponse<SupportTicket>>(
            API_ENDPOINTS.SUPPORT.TICKETS,
            request
        );
        return response.data.data;
    },

    /**
     * Add message to ticket
     */
    async addMessage(request: AddTicketMessageRequest): Promise<TicketMessage> {
        const response = await apiClient.post<ApiResponse<TicketMessage>>(
            API_ENDPOINTS.SUPPORT.MESSAGES(request.ticketId),
            { message: request.message }
        );
        return response.data.data;
    },

    /**
     * Close ticket
     */
    async closeTicket(ticketId: string): Promise<void> {
        await apiClient.patch(`${API_ENDPOINTS.SUPPORT.TICKET_BY_ID(ticketId)}/close`);
    },
};
