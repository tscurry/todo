/* eslint-disable no-unused-vars */
import { Dayjs } from 'dayjs';

export type PostedTodos = {
  temp_uid?: number;
  title: string;
  due_date: string;
  list_name?: string;
};

export type Todos = {
  todo_id: number;
  title: string;
  due_date: string;
  color: string;
  is_completed?: boolean;
};

export type LoginResponse = {
  userError: boolean;
  passwordError: boolean;
  username: string;
};

export type SignupResponse = {
  error: string;
  accountCreated: boolean;
};

export type User = {
  username: string;
  password: string;
};

export type ListItems = {
  item_count: number;
  name: string;
  list_id: number;
  color: string;
};

export type DateTimeProps = {
  selectedDate?: Dayjs | null;
  selectedTime?: Dayjs | null;
  handleChange: (value: Dayjs | null, update?: string) => void | undefined;
};

export type ButtonProps = {
  buttonText: string;
  type?: 'submit' | 'reset' | 'button' | undefined;
  color: string;
  textColor: string;
  parent?: string;
  onClick?: () => void;
  handleSubmit?: () => void;
  disabled?: boolean;
};

export type ListProps = {
  list: ListItems;
  selectedList?: number;
};

export type AuthUser = {
  user_uid: string;
  username: string;
};

export type AuthContextProps = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setIsLoading: (loading: boolean) => void;
};

export type ContextProviderProps = {
  children: React.ReactNode;
};
