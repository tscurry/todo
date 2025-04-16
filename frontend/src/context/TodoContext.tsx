/* eslint-disable no-unused-vars */
import * as React from 'react';
import { ContextProviderProps, Todos } from '../utils/types';
import { getTodos, getTotalCount } from '../api/todo';

type TodoContextProps = {
  todoUpdated: boolean;
  todos: Todos[];
  renderTodos: Todos[];
  totalTodos: number;
  fetchAllTodos: () => Promise<void>;
  setTodos: (todos: Todos[]) => void;
  setRenderTodos: (todos: Todos[]) => void;
  setTotalTodos: (totalTodos: number) => void;
  setUpdate: (todoUpdated: boolean) => void;
};

const TodoContext = React.createContext<TodoContextProps | undefined>(undefined);

const TodoProvider = ({ children }: ContextProviderProps) => {
  const [totalTodos, setTotalTodos] = React.useState<number>(0);
  const [todos, setTodos] = React.useState<Todos[]>([]);
  const [todoUpdated, setTodoUpdated] = React.useState(false);
  const [renderTodos, setRenderTodos] = React.useState<Todos[]>([]);

  const fetchAllTodos = async () => {
    const allTodos = await getTodos();
    if (allTodos) setTodos(allTodos.todos || allTodos);

    const total = await getTotalCount();
    setTotalTodos(total.count);
  };

  return (
    <TodoContext.Provider
      value={{
        todoUpdated,
        totalTodos,
        renderTodos,
        todos,
        setTodos,
        setTotalTodos,
        setRenderTodos,
        setUpdate: setTodoUpdated,
        fetchAllTodos,
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
