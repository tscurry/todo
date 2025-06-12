import * as React from 'react';
import * as authAPI from '../api/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '../utils/types';
import { createTempUid } from '../utils/createTempUid';
import { useAuth } from '../context/AuthContext';

export const useAuthentication = () => {
  const [userError, setUserError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [signupError, setSignupError] = React.useState(false);

  const queryClient = useQueryClient();

  const { accessToken, setAccessToken, setUser, setIsLoading } = useAuth();

  const resetErrors = () => {
    setPasswordError(false);
    setSignupError(false);
    setUserError(false);
  };

  const verifyAuth = async () => {
    const token = await authAPI.refreshAccessToken(accessToken);

    if (token.accessToken) {
      setAccessToken(token.accessToken);

      const response = await authAPI.getUser(token.accessToken);

      if (response.user) {
        setUser(response.user);
        localStorage.removeItem('temp_uid');
        setIsLoading(false);
        return response.user;
      }
    } else {
      createTempUid();
      setAccessToken(null);
      setUser(null);
      setIsLoading(false);
      return null;
    }
  };

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user'],
    queryFn: () => verifyAuth(),
    retry: false,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const signup = useMutation({
    mutationFn: (user: User) => authAPI.createUser(user),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
  });

  const login = useMutation({
    mutationFn: (user: User) => authAPI.loginUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  const logout = useMutation({
    mutationFn: () => authAPI.logoutUser(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  return {
    user,
    isLoading,
    error,

    errorFlags: {
      passwordError,
      userError,
      signupError,
    },

    errorSetters: {
      setPasswordError,
      setSignupError,
      setUserError,
      resetErrors,
    },

    login,
    signup,
    logout,
  };
};
