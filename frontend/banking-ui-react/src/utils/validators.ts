/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number (basic validation)
 */
export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Validate account number format
 */
export const isValidAccountNumber = (accountNumber: string): boolean => {
    // Assuming account numbers are alphanumeric and 10-20 characters
    const accountRegex = /^[A-Z0-9]{10,20}$/;
    return accountRegex.test(accountNumber);
};

/**
 * Validate amount (must be positive and have max 2 decimal places)
 */
export const isValidAmount = (amount: number): boolean => {
    if (amount <= 0) return false;
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    return decimalPlaces <= 2;
};

/**
 * Validate minimum amount
 */
export const isMinAmount = (amount: number, min: number): boolean => {
    return amount >= min;
};

/**
 * Validate maximum amount
 */
export const isMaxAmount = (amount: number, max: number): boolean => {
    return amount <= max;
};

/**
 * Validate date is not in the past
 */
export const isNotPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
};

/**
 * Validate required field
 */
export const isRequired = (value: any): boolean => {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
};

/**
 * Validate minimum length
 */
export const minLength = (value: string, min: number): boolean => {
    return value.length >= min;
};

/**
 * Validate maximum length
 */
export const maxLength = (value: string, max: number): boolean => {
    return value.length <= max;
};
