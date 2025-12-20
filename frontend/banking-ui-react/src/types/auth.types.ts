// Auth Types
export interface User {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    customerId?: string;
    lastLogin?: string;
    createdAt: string;
}

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPPORT' | 'MANAGER';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    user: User;
    expiresIn: number;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

export interface Session {
    sessionId: string;
    userId: string;
    deviceInfo: string;
    ipAddress: string;
    createdAt: string;
    lastActivity: string;
    expiresAt: string;
}
