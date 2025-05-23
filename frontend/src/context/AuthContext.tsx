/* eslint-disable no-unused-vars */
import * as React from 'react';
import { ContextProviderProps } from '../utils/types';
import { getUser } from '../api/auth';
import { createTempUid } from '../utils/createTempUid';

type AuthContextProps = {
  user: string | null;
  userError: boolean;
  passwordError: boolean;
  signupError: boolean;
  isAuthenticated: boolean;
  authenticateUser: (user: string) => void;
  setUser: (user: string | null) => void;
  setSignupError: (signupError: boolean) => void;
  setUserError: (userError: boolean) => void;
  setPasswordError: (passwordError: boolean) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  resetErrors: () => void;
};
const AuthContext = React.createContext<AuthContextProps | undefined>(undefined);

const AuthProvider = ({ children }: ContextProviderProps) => {
  const [isAuthenticated, setAuthenticated] = React.useState(false);
  const [userError, setUserError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [signupError, setSignupError] = React.useState(false);
  const [user, setUser] = React.useState<string | null>(null);

  const resetErrors = () => {
    setPasswordError(false);
    setSignupError(false);
    setUserError(false);
  };

  const authenticateUser = (user: string) => {
    setUser(user);
    setAuthenticated(true);
  };

  React.useEffect(() => {
    const verifyAuth = async () => {
      const username = await getUser();
      if (username) {
        setUser(username);
        setAuthenticated(true);
        localStorage.removeItem('temp_uid');
      } else {
        setAuthenticated(false);
        createTempUid();
        setUser(null);
      }
    };

    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        signupError,
        isAuthenticated,
        userError,
        passwordError,
        authenticateUser,
        setUser,
        setSignupError,
        setAuthenticated,
        setUserError,
        setPasswordError,
        resetErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};

export default AuthProvider;
