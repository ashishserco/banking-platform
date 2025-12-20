// Support Ticket Types
export interface SupportTicket {
    ticketId: string;
    customerId: string;
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    messages: TicketMessage[];
}

export type TicketCategory = 'ACCOUNT' | 'PAYMENT' | 'TRANSACTION' | 'TECHNICAL' | 'OTHER';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';

export interface TicketMessage {
    messageId: string;
    ticketId: string;
    senderId: string;
    senderName: string;
    senderType: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
    message: string;
    createdAt: string;
    attachments?: string[];
}

export interface CreateTicketRequest {
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
}

export interface AddTicketMessageRequest {
    ticketId: string;
    message: string;
    attachments?: File[];
}
