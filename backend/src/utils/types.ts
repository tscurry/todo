export type Todos = {
  todo_id: number;
  temp_uid: string;
  user_uid: string;
  title: string;
  due_date: string;
  is_completed: boolean;
};

export type Lists = {
  name: string;
  list_id: number;
  color: string;
};

export type User = {
  username: string;
  user_uid: string;
};

export type CustomRequest = {
  user?: User;
};
