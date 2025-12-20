// Notification Types
export interface Notification {
    notificationId: string;
    userId: string;
    notificationType: NotificationType;
    eventType: string;
    title: string;
    message: string;
    status: NotificationStatus;
    priority: NotificationPriority;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
    metadata?: Record<string, any>;
}

export type NotificationType = 'TRANSACTION' | 'PAYMENT' | 'ACCOUNT' | 'SECURITY' | 'SYSTEM';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface NotificationPreferences {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    transactionAlerts: boolean;
    paymentAlerts: boolean;
    securityAlerts: boolean;
}
