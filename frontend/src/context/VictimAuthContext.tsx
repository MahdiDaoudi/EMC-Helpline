import React, { createContext, useContext, useState, useEffect } from 'react';

interface VictimAuthContextType {
  token: string | null;
  referenceNumber: string | null;
  isAuthenticated: boolean;
  login: (token: string, referenceNumber: string) => void;
  logout: () => void;
}

const VictimAuthContext = createContext<VictimAuthContextType | undefined>(undefined);

export const VictimAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('victim_token'));
  const [referenceNumber, setReferenceNumber] = useState<string | null>(() => localStorage.getItem('victim_ref'));

  const login = (newToken: string, newRef: string) => {
    localStorage.setItem('victim_token', newToken);
    localStorage.setItem('victim_ref', newRef);
    setToken(newToken);
    setReferenceNumber(newRef);
  };

  const logout = () => {
    localStorage.removeItem('victim_token');
    localStorage.removeItem('victim_ref');
    setToken(null);
    setReferenceNumber(null);
  };

  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem('victim_token'));
      setReferenceNumber(localStorage.getItem('victim_ref'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <VictimAuthContext.Provider
      value={{
        token,
        referenceNumber,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </VictimAuthContext.Provider>
  );
};

export const useVictimAuth = () => {
  const context = useContext(VictimAuthContext);
  if (!context) {
    throw new Error('useVictimAuth must be used within a VictimAuthProvider');
  }
  return context;
};
