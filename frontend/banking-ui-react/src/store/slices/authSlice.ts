import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginRequest } from '@/types/auth.types';
import { authService } from '@/services/api';
import { STORAGE_KEYS } from '@/utils/constants';

const getUserFromStorage = () => {
    try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
        console.error("Failed to parse user from storage", e);
        localStorage.removeItem(STORAGE_KEYS.USER); // Clean up bad data
        return null;
    }
};

// Initial state
const initialState: AuthState = {
    isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
    user: getUserFromStorage(),
    token: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
    loading: false,
    error: null,
};

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        await authService.logout();
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Logout failed');
    }
});

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const user = await authService.getCurrentUser();
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            return user;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get user');
        }
    }
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Logout
        builder.addCase(logout.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(logout.fulfilled, (state) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = null;
        });
        builder.addCase(logout.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            // Still clear auth state even if logout fails
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
        });

        // Get current user
        builder.addCase(getCurrentUser.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getCurrentUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
        });
        builder.addCase(getCurrentUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
