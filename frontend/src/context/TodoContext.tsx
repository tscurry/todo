/* eslint-disable no-unused-vars */
import * as React from 'react';
import { ContextProviderProps, PostedTodos, Todos } from '../utils/types';
import {
  deleteTodo,
  getTodos,
  getTotalCount,
  markCompleted,
  postTodo,
  updateTodo,
} from '../api/todo';

type TodoContextProps = {
  todoUpdated: boolean;
  todos: Todos[];
  totalTodos: number;
  setTodos: (todos: Todos[]) => void;
  getTotalTodos: () => Promise<void>;
  getUserTodos: () => Promise<void>;
  updateUserTodos: (id: number, todo: PostedTodos) => Promise<boolean | undefined>;
  postUserTodos: (todo: PostedTodos) => Promise<boolean | undefined>;
  setUpdate: (todoUpdated: boolean) => void;
  markTodoComplete: (id: number) => Promise<boolean | undefined>;
  deleteUserTodo: (id: number) => Promise<boolean | undefined>;
};

const TodoContext = React.createContext<TodoContextProps | undefined>(undefined);

const TodoProvider = ({ children }: ContextProviderProps) => {
  const [totalTodos, setTotalTodos] = React.useState<number>(0);
  const [todos, setTodos] = React.useState<Todos[]>([]);
  const [todoUpdated, setTodoUpdated] = React.useState(false);

  const getTotalTodos = async () => {
    const total = await getTotalCount();

    if (total) setTotalTodos(total.count);
  };

  const getUserTodos = async () => {
    const fetchTodos = await getTodos();

    fetchTodos ? setTodos(fetchTodos.todos) : setTodos([]);
  };

  const updateUserTodos = async (id: number, todo: PostedTodos) => {
    const update = await updateTodo(id, todo);

    if (update) return true;
    else return false;
  };

  const postUserTodos = async (todo: PostedTodos) => {
    const post = await postTodo(todo);

    if (post) return true;
    else return false;
  };

  const markTodoComplete = async (id: number) => {
    const mark = await markCompleted(id);
    if (mark) return true;
    else return false;
  };

  const deleteUserTodo = async (id: number) => {
    const delete_ = await deleteTodo(id);
    if (delete_) return true;
    else return false;
  };

  return (
    <TodoContext.Provider
      value={{
        todoUpdated,
        totalTodos,
        todos,
        setTodos,
        getTotalTodos,
        setUpdate: setTodoUpdated,
        getUserTodos,
        postUserTodos,
        updateUserTodos,
        markTodoComplete,
        deleteUserTodo,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = React.useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a AuthProvider');
  }
  return context;
};

export default TodoProvider;
