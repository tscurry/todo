import { User } from '../utils/types';

//check auth status
export const checkAuthStatus = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/status`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    return data.isAuthenticated;
  } catch (error) {
    // console.error(error);
    throw new Error('There was an unexpected error. Please refresh page to continue');
  }
};

//get username
export const getUser = async () => {
  try {
    const respnse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/user`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await respnse.json();
    return data?.username || null;
  } catch (error) {
    // console.error(error);
    throw new Error('There was an unexpected error. Please refresh page to continue');
  }
};

// signup
export const createUser = async (user: User) => {
  const temp_uid = JSON.parse(localStorage.getItem('temp_uid')!) || '';

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: user.username,
        password: user.password,
        temp_uid,
      }),
      credentials: 'include',
    });

    if (response.status === 201 && temp_uid) {
      localStorage.removeItem('temp_uid');
    }

    return await response.json();
  } catch (error) {
    // console.error(error);
    throw new Error('There was an unexpected error. Please refresh page to continue');
  }
};

//login
export const loginUser = async (user: User) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: user.username,
        password: user.password,
      }),
      credentials: 'include',
    });

    return await response.json();
  } catch (error) {
    // console.error(error);
    throw new Error('There was an unexpected error. Please refresh page to continue');
  }
};

export const logoutUser = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    return await response.json();
  } catch (error) {
    // console.error(error);
    throw new Error('There was an unexpected error. Please refresh page to continue');
  }
};
