import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
    id: string | number;
    date: string;
    desc: string;
    type: 'Debit' | 'Credit';
    amount: number;
    status: 'Completed' | 'Pending' | 'Failed';
    ref: string;
    category?: string;
}

interface TransactionState {
    list: Transaction[];
}

const STORAGE_KEY = 'banking_transactions';

const loadTransactions = (): Transaction[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return [
        { id: 1, date: '2025-12-19T10:30:00Z', desc: 'Transfer to John Doe', type: 'Debit', amount: -500.00, status: 'Completed', ref: 'TRX-998877' },
        { id: 2, date: '2025-12-18T14:20:00Z', desc: 'Salary Deposit', type: 'Credit', amount: 3500.00, status: 'Completed', ref: 'SAL-0012' },
        { id: 3, date: '2025-12-18T09:15:00Z', desc: 'Netflix Subscription', type: 'Debit', amount: -15.99, status: 'Completed', ref: 'SUB-1122' },
        { id: 4, date: '2025-12-17T18:45:00Z', desc: 'ATM Withdrawal', type: 'Debit', amount: -200.00, status: 'Completed', ref: 'ATM-3344' },
    ];
};

const initialState: TransactionState = {
    list: loadTransactions(),
};

const transactionSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        addTransaction: (state, action: PayloadAction<Omit<Transaction, 'id' | 'date' | 'status'>>) => {
            const newTransaction: Transaction = {
                ...action.payload,
                id: `TRX-${Date.now()}`,
                date: new Date().toISOString(),
                status: 'Completed'
            };
            state.list.unshift(newTransaction);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.list));
        }
    }
});

export const { addTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
