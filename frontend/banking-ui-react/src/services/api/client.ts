import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT, STORAGE_KEYS } from '@/utils/constants';
import { generateCorrelationId } from '@/utils/idempotency';
import { formatApiError } from '@/utils/errorHandler';

/**
 * API Client for making HTTP requests to backend services
 * Includes automatic token injection, correlation ID generation, and error handling
 */
class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: REQUEST_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    /**
     * Setup request and response interceptors
     */
    private setupInterceptors(): void {
        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // Add auth token
                const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Add correlation ID for request tracking
                const correlationId = generateCorrelationId();
                config.headers['X-Correlation-ID'] = correlationId;

                // Log request in development
                if (import.meta.env.DEV) {
                    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
                        correlationId,
                        data: config.data,
                        params: config.params,
                    });
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => {
                // Log response in development
                if (import.meta.env.DEV) {
                    console.log(`[API Response] ${response.config.url}`, {
                        status: response.status,
                        data: response.data,
                    });
                }

                return response;
            },
            async (error: AxiosError) => {
                const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

                // Log error in development
                if (import.meta.env.DEV) {
                    console.error('[API Error]', {
                        url: originalRequest?.url,
                        status: error.response?.status,
                        message: error.message,
                        data: error.response?.data,
                    });
                }

                // Handle 401 Unauthorized - attempt token refresh
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
                        if (!refreshToken) {
                            throw new Error('No refresh token available');
                        }

                        // Attempt to refresh token
                        const response = await this.client.post('/auth/refresh', {
                            refreshToken,
                        });

                        const { token } = response.data;
                        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

                        // Retry original request with new token
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }

                        return this.client(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed - clear auth and redirect to login
                        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                        localStorage.removeItem(STORAGE_KEYS.USER);
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                // Format and reject error
                const formattedError = formatApiError(error);
                return Promise.reject(formattedError);
            }
        );
    }

    /**
     * Generic request method
     */
    async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.request<T>(config);
    }

    /**
     * GET request
     */
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.get<T>(url, config);
    }

    /**
     * POST request
     */
    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.post<T>(url, data, config);
    }

    /**
     * PUT request
     */
    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.put<T>(url, data, config);
    }

    /**
     * PATCH request
     */
    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.patch<T>(url, data, config);
    }

    /**
     * DELETE request
     */
    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.delete<T>(url, config);
    }
}

// Export singleton instance
export const apiClient = new ApiClient();
