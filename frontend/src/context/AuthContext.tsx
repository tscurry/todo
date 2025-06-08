import * as React from 'react';
import { AuthContextProps, AuthUser, ContextProviderProps } from '../utils/types';

const AuthContext = React.createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: ContextProviderProps) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <AuthContext.Provider
      value={{ accessToken, user, setAccessToken, setUser, isLoading, setIsLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
