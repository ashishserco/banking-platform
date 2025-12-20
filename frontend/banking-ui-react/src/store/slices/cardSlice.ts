import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Card {
    id: string;
    number: string;
    holderName: string;
    expiry: string;
    cvv: string;
    type: 'Debit' | 'Credit';
    brand: 'Visa' | 'Mastercard';
    status: 'Active' | 'Blocked' | 'Inactive';
    isBlocked: boolean;
    pinSet: boolean;
    limits: {
        atm: number;
        online: number;
        pos: number;
    };
    linkedAccountId?: string;
}

interface CardState {
    list: Card[];
}

const STORAGE_KEY = 'banking_cards';

const loadCards = (): Card[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return [
        {
            id: 'c1',
            number: '4532 7812 9003 4455',
            holderName: 'ADYA SHARMA',
            expiry: '12/28',
            cvv: '123',
            type: 'Debit',
            brand: 'Visa',
            status: 'Active',
            isBlocked: false,
            pinSet: true,
            limits: {
                atm: 2000,
                online: 5000,
                pos: 3000
            },
            linkedAccountId: '1'
        },
        {
            id: 'c2',
            number: '5412 8899 3344 1122',
            holderName: 'ADYA SHARMA',
            expiry: '08/30',
            cvv: '999',
            type: 'Credit',
            brand: 'Mastercard',
            status: 'Active',
            isBlocked: false,
            pinSet: true,
            limits: {
                atm: 1000,
                online: 10000,
                pos: 8000
            },
            linkedAccountId: '3'
        }
    ];
};

const initialState: CardState = {
    list: loadCards(),
};

const cardSlice = createSlice({
    name: 'cards',
    initialState,
    reducers: {
        toggleBlock: (state, action: PayloadAction<string>) => {
            const card = state.list.find(c => c.id === action.payload);
            if (card) {
                card.isBlocked = !card.isBlocked;
                card.status = card.isBlocked ? 'Blocked' : 'Active';
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state.list));
            }
        },
        updateLimits: (state, action: PayloadAction<{ id: string, limits: Card['limits'] }>) => {
            const card = state.list.find(c => c.id === action.payload.id);
            if (card) {
                card.limits = action.payload.limits;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state.list));
            }
        },
        setPin: (state, action: PayloadAction<{ id: string, pin: string }>) => {
            const card = state.list.find(c => c.id === action.payload.id);
            if (card) {
                card.pinSet = true;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state.list));
            }
        }
    }
});

export const { toggleBlock, updateLimits, setPin } = cardSlice.actions;
export default cardSlice.reducer;
