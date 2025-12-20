import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
    id: string | number;
    title: string;
    desc: string;
    time: string;
    type: 'credit' | 'debit' | 'security' | 'info' | 'promo' | 'warning';
}

interface NotificationState {
    list: Notification[];
}

const STORAGE_KEY = 'banking_notifications';

const loadNotifications = (): Notification[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return [
        { id: 1, title: 'Salary Credited', desc: 'Your account XXXX-8903 has been credited with $3,500.00', time: '2 mins ago', type: 'credit' },
        { id: 2, title: 'Security Alert', desc: 'New login detected from Window 10, Chrome Browser.', time: '1 hour ago', type: 'security' },
    ];
};

const initialState: NotificationState = {
    list: loadNotifications(),
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'time'>>) => {
            const newNotification: Notification = {
                ...action.payload,
                id: Date.now(),
                time: 'Just now'
            };
            state.list.unshift(newNotification);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.list));
        },
        clearAll: (state) => {
            state.list = [];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.list));
        }
    }
});

export const { addNotification, clearAll } = notificationSlice.actions;
export default notificationSlice.reducer;
