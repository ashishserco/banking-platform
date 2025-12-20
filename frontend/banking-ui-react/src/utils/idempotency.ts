import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique idempotency key for payment/transfer operations
 */
export const generateIdempotencyKey = (): string => {
    return `idem_${uuidv4()}`;
};

/**
 * Generate a correlation ID for request tracking
 */
export const generateCorrelationId = (): string => {
    return `corr_${uuidv4()}`;
};

/**
 * Store idempotency key to prevent duplicate submissions
 */
export const storeIdempotencyKey = (key: string, expiryMinutes: number = 60): void => {
    const expiry = new Date().getTime() + expiryMinutes * 60 * 1000;
    localStorage.setItem(`idem_${key}`, expiry.toString());
};

/**
 * Check if idempotency key has been used
 */
export const isIdempotencyKeyUsed = (key: string): boolean => {
    const stored = localStorage.getItem(`idem_${key}`);
    if (!stored) return false;

    const expiry = parseInt(stored, 10);
    if (new Date().getTime() > expiry) {
        localStorage.removeItem(`idem_${key}`);
        return false;
    }

    return true;
};

/**
 * Clear expired idempotency keys
 */
export const clearExpiredIdempotencyKeys = (): void => {
    const now = new Date().getTime();
    Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('idem_')) {
            const expiry = parseInt(localStorage.getItem(key) || '0', 10);
            if (now > expiry) {
                localStorage.removeItem(key);
            }
        }
    });
};
