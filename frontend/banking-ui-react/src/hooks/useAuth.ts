import { useAppSelector, useAppDispatch } from './useRedux';
import { logout } from '@/store/slices/authSlice';

/**
 * Hook for authentication state and actions
 */
export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated, user, loading, error } = useAppSelector((state) => state.auth);

    const handleLogout = async () => {
        await dispatch(logout());
    };

    return {
        isAuthenticated,
        user,
        loading,
        error,
        logout: handleLogout,
    };
};
