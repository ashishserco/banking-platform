import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Beneficiary {
    id: number | string;
    name: string;
    acc: string;
    bank: string;
    favorite: boolean;
}

interface BeneficiaryState {
    list: Beneficiary[];
}

const STORAGE_KEY = 'banking_beneficiaries';

const loadBeneficiaries = (): Beneficiary[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return [
        { id: 1, name: 'John Doe', acc: '**** 1234', bank: 'Chase Bank', favorite: true },
        { id: 2, name: 'Alice Smith', acc: '**** 5678', bank: 'Bank of America', favorite: true },
        { id: 3, name: 'Robert Johnson', acc: '**** 9012', bank: 'Wells Fargo', favorite: false },
        { id: 4, name: 'Emily Davis', acc: '**** 3456', bank: 'Citi Bank', favorite: false },
    ];
};

const initialState: BeneficiaryState = {
    list: loadBeneficiaries(),
};

const beneficiarySlice = createSlice({
    name: 'beneficiaries',
    initialState,
    reducers: {
        addBeneficiary: (state, action: PayloadAction<Omit<Beneficiary, 'id' | 'favorite'>>) => {
            const newBeneficiary = {
                ...action.payload,
                id: Date.now(),
                favorite: false
            };
            state.list.push(newBeneficiary);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.list));
        },
        toggleFavorite: (state, action: PayloadAction<number | string>) => {
            const beneficiary = state.list.find(b => b.id === action.payload);
            if (beneficiary) {
                beneficiary.favorite = !beneficiary.favorite;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state.list));
            }
        }
    }
});

export const { addBeneficiary, toggleFavorite } = beneficiarySlice.actions;
export default beneficiarySlice.reducer;
