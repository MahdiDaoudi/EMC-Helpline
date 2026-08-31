import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, RoleName } from '../types';
import { loginRequest } from '../services/auth.service';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  hasRole: (roles: RoleName[]) => boolean;
}

const TOKEN_KEY = 'emc_token';
const USER_KEY = 'emc_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const clearSession = useCallback(() => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);

        if (token && savedUser) {
          const parsed = JSON.parse(savedUser) as User;
          setUser(parsed);

          // Fetch fresh profile asynchronously to update signed avatar URL & latest info
          try {
            const { ProfileService } = await import('../services/profile.service');
            const freshUser = await ProfileService.getProfile();
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
            }
          } catch (profileErr) {
            console.warn('Failed to refresh profile on init:', profileErr);
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();
  }, [clearSession]);

  const login = async (email: string, password: string) => {
    try {
      const { accessToken, user: authenticatedUser } = await loginRequest(email, password);

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message as string | undefined;

        if (message === 'ACCOUNT_LOCKED' || err.response?.status === 403) {
          throw new Error('ACCOUNT_LOCKED');
        }

        if (err.response?.status === 401) {
          throw new Error('INVALID_CREDENTIALS');
        }
      }

      throw new Error('AUTH_FAILED');
    }
  };

  const logout = () => {
    clearSession();
  };

  const updateUser = (nextUser: User) => {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const hasRole = (allowedRoles: RoleName[]): boolean => {
    if (!user?.role) return false;
    return allowedRoles.includes(user.role.name);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
