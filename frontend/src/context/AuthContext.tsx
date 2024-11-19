/* eslint-disable no-unused-vars */
import * as React from 'react';
import { checkAuthStatus, createUser, getUser, loginUser, logoutUser } from '../api/auth';
import { ContextProviderProps, User } from '../utils/types';

type AuthContextProps = {
  user: string | null;
  userError: boolean;
  passwordError: boolean;
  signupError: boolean;
  isAuthenticated: boolean;
  checkAuthentication: () => void;
  resetErrors: () => void;
  login: (user: User) => Promise<boolean | undefined>;
  signup: (user: User) => Promise<boolean | undefined>;
  logout: () => Promise<boolean | undefined>;
};
const AuthContext = React.createContext<AuthContextProps | undefined>(undefined);

const AuthProvider = ({ children }: ContextProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userError, setUserError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [signupError, setSignupError] = React.useState(false);
  const [user, setUser] = React.useState<string | null>(null);

  const checkAuthentication = async () => {
    const response = await checkAuthStatus();
    if (response) {
      localStorage.removeItem('temp_uid');
      const user = await getUser();
      setIsAuthenticated(response);
      if (user) {
        setUser(user);
      }
    } else {
      setIsAuthenticated(response);
    }
  };

  const resetErrors = () => {
    setPasswordError(false);
    setSignupError(false);
    setUserError(false);
  };

  React.useEffect(() => {
    checkAuthentication();
  }, [isAuthenticated]);

  const login = async (newUser: User) => {
    try {
      const response = await loginUser(newUser);
      if (response.userError) {
        setPasswordError(false);
        setUserError(true);
        return false;
      } else if (response.passwordError) {
        setUserError(false);
        setPasswordError(true);
        return false;
      } else {
        setUser(response);
        setUserError(false);
        setPasswordError(false);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const logout = async () => {
    const response = await logoutUser();

    if (response) {
      setUser(null);
      setIsAuthenticated(false);
      return true;
    } else {
      setIsAuthenticated(true);
      return false;
    }
  };

  const signup = async (newUser: User) => {
    const response = await createUser(newUser);

    if (response.error) {
      setSignupError(true);
      return false;
    } else {
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        logout,
        login,
        signup,
        resetErrors,
        checkAuthentication,
        userError,
        passwordError,
        signupError,
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
