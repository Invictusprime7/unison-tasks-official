import React, { createContext, ReactNode } from 'react';
import { useAuth, AuthState, AuthActions } from '@/hooks/useAuth';

export type AuthContextType = AuthState & AuthActions;

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};