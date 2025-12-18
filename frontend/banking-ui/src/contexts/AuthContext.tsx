import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/apiClient';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Verify token and get user info
        const response = await apiClient.get('/auth/me');
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Mock login for demonstration
      // In real implementation, this would call the authentication service
      const mockResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: '1',
          email: email,
          firstName: 'John',
          lastName: 'Doe',
          role: 'customer'
        }
      };

      localStorage.setItem('authToken', mockResponse.token);
      setUser(mockResponse.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const response = await apiClient.post('/auth/refresh');
      const { token } = response.data;
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};