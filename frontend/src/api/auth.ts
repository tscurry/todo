import { User } from '../utils/types';

//get username
export const getUser = async (accessToken: string | null) => {
  try {
    const respnse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/user`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (respnse.status === 200) return await respnse.json();
    else if (respnse.status === 401) return 'Unauthorized';
    else if (respnse.status === 403) return 'Renew';
  } catch (error) {
    throw new Error('There was an unexpected error. Please refresh page to continue');
  }
};

export const refreshAccessToken = async (accessToken: string | null) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.status === 200) {
      return await response.json();
    } else {
      return 'Denied';
    }
  } catch (error) {
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
    throw new Error('There was an unexpected error. Please refresh page to continue');
  }
};
