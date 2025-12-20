import { format, parseISO } from 'date-fns';
import { CURRENCY_SYMBOL, DEFAULT_CURRENCY, DATE_FORMAT, DATE_TIME_FORMAT } from './constants';

/**
 * Format currency amount with symbol
 */
export const formatCurrency = (
    amount: number,
    currency: string = DEFAULT_CURRENCY,
    showSymbol: boolean = true
): string => {
    const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    if (showSymbol) {
        const symbol = CURRENCY_SYMBOL[currency] || currency;
        return `${symbol}${formatted}`;
    }

    return formatted;
};

/**
 * Format date string to readable format
 */
export const formatDate = (dateString: string, formatStr: string = DATE_FORMAT): string => {
    try {
        const date = parseISO(dateString);
        return format(date, formatStr);
    } catch (error) {
        return dateString;
    }
};

/**
 * Format date to date-time format
 */
export const formatDateTime = (dateString: string): string => {
    return formatDate(dateString, DATE_TIME_FORMAT);
};

/**
 * Format account number for display (mask middle digits)
 */
export const formatAccountNumber = (accountNumber: string, maskLength: number = 8): string => {
    if (accountNumber.length <= maskLength) {
        return accountNumber;
    }

    const visibleStart = 4;
    const visibleEnd = 4;
    const masked = '*'.repeat(accountNumber.length - visibleStart - visibleEnd);

    return `${accountNumber.slice(0, visibleStart)}${masked}${accountNumber.slice(-visibleEnd)}`;
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatCompactNumber = (num: number): string => {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Capitalize first letter of string
 */
export const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format status text (convert SNAKE_CASE to Title Case)
 */
export const formatStatus = (status: string): string => {
    return status
        .split('_')
        .map((word) => capitalize(word))
        .join(' ');
};
