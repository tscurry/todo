import * as React from 'react';
import * as authAPI from '../api/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '../utils/types';
import { createTempUid } from '../utils/createTempUid';

export const useAuth = () => {
  const [userError, setUserError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [signupError, setSignupError] = React.useState(false);

  const queryClient = useQueryClient();

  const resetErrors = () => {
    setPasswordError(false);
    setSignupError(false);
    setUserError(false);
  };

  const verifyAuth = async () => {
    const username = await authAPI.getUser();
    if (username) {
      localStorage.removeItem('temp_uid');
    } else {
      createTempUid();
    }
    return username;
  };

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user'],
    queryFn: () => verifyAuth(),
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
