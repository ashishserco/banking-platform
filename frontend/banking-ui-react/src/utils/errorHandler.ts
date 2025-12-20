import { ApiError } from '@/types/api.types';

/**
 * Extract error message from various error formats
 */
export const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') {
        return error;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'object' && error !== null) {
        const apiError = error as any;

        // Check for API error format
        if (apiError.response?.data?.message) {
            return apiError.response.data.message;
        }

        if (apiError.response?.data?.errors && Array.isArray(apiError.response.data.errors)) {
            return apiError.response.data.errors.join(', ');
        }

        if (apiError.message) {
            return apiError.message;
        }
    }

    return 'An unexpected error occurred';
};

/**
 * Format API error for display
 */
export const formatApiError = (error: any): ApiError => {
    const message = getErrorMessage(error);
    const correlationId = error?.response?.headers?.['x-correlation-id'];
    const code = error?.response?.data?.code || error?.code;

    return {
        message,
        code,
        correlationId,
        details: error?.response?.data?.details,
    };
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
    return (
        error?.message === 'Network Error' ||
        error?.code === 'ECONNABORTED' ||
        error?.code === 'ERR_NETWORK'
    );
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: any): boolean => {
    return error?.response?.status === 401 || error?.response?.status === 403;
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: any): boolean => {
    return error?.response?.status === 400 && error?.response?.data?.details;
};

/**
 * Get validation errors from API response
 */
export const getValidationErrors = (error: any): Record<string, string[]> => {
    return error?.response?.data?.details || {};
};
