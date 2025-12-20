// API Response Types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    errors?: string[];
    correlationId?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pageSize: number;
    pageNumber: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface ApiError {
    message: string;
    code?: string;
    correlationId?: string;
    details?: Record<string, string[]>;
}

export interface PaginationParams {
    pageNumber?: number;
    pageSize?: number;
}

export interface SortParams {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
    [key: string]: string | number | boolean | undefined;
}
