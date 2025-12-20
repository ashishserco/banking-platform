import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import beneficiaryReducer from './slices/beneficiarySlice';
import accountReducer from './slices/accountSlice';
import transactionReducer from './slices/transactionSlice';
import notificationReducer from './slices/notificationSlice';
import cardReducer from './slices/cardSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        beneficiaries: beneficiaryReducer,
        accounts: accountReducer,
        transactions: transactionReducer,
        notifications: notificationReducer,
        cards: cardReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['auth/login/fulfilled'],
            },
        }),
    devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
