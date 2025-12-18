import { format, parseISO, isValid } from 'date-fns';

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) {
      return 'Invalid date';
    }
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format date and time for display
 */
export const formatDateTime = (dateString: string | Date): string => {
  return formatDate(dateString, 'MMM dd, yyyy HH:mm');
};

/**
 * Format account number for display (mask middle digits)
 */
export const formatAccountNumber = (accountNumber: string, maskLength: number = 6): string => {
  if (accountNumber.length <= 8) {
    return accountNumber; // Don't mask short account numbers
  }
  
  const start = accountNumber.slice(0, 4);
  const end = accountNumber.slice(-4);
  const mask = '*'.repeat(maskLength);
  
  return `${start}${mask}${end}`;
};

/**
 * Format transaction type for display
 */
export const formatTransactionType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'TRANSFER': 'Money Transfer',
    'DEPOSIT': 'Deposit',
    'WITHDRAWAL': 'Withdrawal',
    'PAYMENT': 'Payment',
    'BILL_PAYMENT': 'Bill Payment',
    'MOBILE_RECHARGE': 'Mobile Recharge',
  };
  
  return typeMap[type] || type;
};

/**
 * Format payment status for display
 */
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PENDING': 'Pending',
    'PROCESSING': 'Processing',
    'COMPLETED': 'Completed',
    'FAILED': 'Failed',
    'CANCELLED': 'Cancelled',
    'ACTIVE': 'Active',
    'INACTIVE': 'Inactive',
    'FROZEN': 'Frozen',
    'CLOSED': 'Closed',
  };
  
  return statusMap[status] || status;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digits
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Format international numbers with + prefix
  if (digits.length > 10) {
    return `+${digits}`;
  }
  
  return phoneNumber; // Return original if can't format
};