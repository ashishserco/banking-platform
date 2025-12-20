import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Account {
    id: string;
    type: string;
    number: string;
    balance: number;
    currency: string;
    status: string;
    expiry: string | null;
    overdraftLimit?: number;
}

interface AccountState {
    list: Account[];
}

const STORAGE_KEY = 'banking_accounts';

const loadAccounts = (): Account[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return [
        {
            id: '1',
            type: 'Savings Account',
            number: 'XXXX-XXXX-8903',
            balance: 125030.50,
            currency: 'USD',
            status: 'Active',
            expiry: null,
        },
        {
            id: '2',
            type: 'Business Current',
            number: 'XXXX-XXXX-4521',
            balance: 50400.00,
            currency: 'USD',
            status: 'Active',
            expiry: null,
            overdraftLimit: 5000,
        },
        {
            id: '3',
            type: 'Platinum Credit Card',
            number: 'XXXX-XXXX-3344',
            balance: -1240.00,
            currency: 'USD',
            status: 'Active',
            expiry: '12/28',
        },
    ];
};

const initialState: AccountState = {
    list: loadAccounts(),
};

const accountSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        addAccount: (state, action: PayloadAction<Omit<Account, 'id' | 'status' | 'number'>>) => {
            const newAccount: Account = {
                ...action.payload,
                id: Date.now().toString(),
                status: 'Active',
                number: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`
            };
            state.list.push(newAccount);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.list));
        },
        updateBalance: (state, action: PayloadAction<{ id: string, amount: number }>) => {
            const account = state.list.find(a => a.id === action.payload.id);
            if (account) {
                account.balance += action.payload.amount;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state.list));
            }
        }
    }
});

export const { addAccount, updateBalance } = accountSlice.actions;
export default accountSlice.reducer;
