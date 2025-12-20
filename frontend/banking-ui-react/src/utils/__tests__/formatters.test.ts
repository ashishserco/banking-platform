import { describe, it, expect } from 'vitest';
import {
    formatCurrency,
    formatAccountNumber,
    capitalize,
    formatStatus
} from '../formatters';

describe('formatters', () => {
    describe('formatCurrency', () => {
        it('formats USD by default', () => {
            expect(formatCurrency(1000)).toBe('$1,000.00');
        });

        it('formats without symbol', () => {
            expect(formatCurrency(1000, 'USD', false)).toBe('1,000.00');
        });

        it('handles different currencies', () => {
            expect(formatCurrency(500, 'EUR')).toBe('€500.00');
        });
    });

    describe('formatAccountNumber', () => {
        it('masks account numbers correctly', () => {
            expect(formatAccountNumber('123456789012')).toBe('1234****9012');
        });

        it('returns original string if shorter than mask length', () => {
            expect(formatAccountNumber('123')).toBe('123');
        });
    });

    describe('capitalize', () => {
        it('capitalizes the first letter', () => {
            expect(capitalize('hello')).toBe('Hello');
            expect(capitalize('WORLD')).toBe('World');
        });
    });

    describe('formatStatus', () => {
        it('formats snake_case to title case', () => {
            expect(formatStatus('PENDING_REVIEW')).toBe('Pending Review');
            expect(formatStatus('ACTIVE')).toBe('Active');
        });
    });
});
