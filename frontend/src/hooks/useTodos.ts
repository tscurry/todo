import * as todosAPI from '../api/todo';
import * as listAPI from '../api/list';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PostedTodos } from '../utils/types';
import { useAuth } from '../context/AuthContext';

export const useTodos = (listId: number) => {
  const queryClient = useQueryClient();
  const { accessToken, isLoading: authLoading } = useAuth();

  const getTodos = async (accessToken: string | null) => {
    let todos;

    if (accessToken) {
      todos = await todosAPI.getTodos(accessToken);
    }

    if (listId !== undefined && listId !== 0) {
      if (listId === -1) {
        todos = await todosAPI.getTodos(accessToken);
      } else {
        todos = await listAPI.getListTodos(listId, accessToken);
      }
    }

    const total = await todosAPI.getTotalCount(accessToken);
    const completed = await todosAPI.getCompleted(accessToken);

    return { todos, total, completed };
  };

  const {
    data,
    isLoading,
    error,
    refetch: refetchTodos,
  } = useQuery({
    queryKey: ['todos', listId ?? 'all', accessToken],
    queryFn: () => getTodos(accessToken),
    enabled: !authLoading,
    staleTime: Infinity,
  });

  const todos = listId === 0 ? data?.completed?.completedTodos ?? [] : data?.todos ?? [];
  const total = data?.total ?? 0;
  const completedTotal = data?.completed?.sum?.count ?? 0;

  const addTodo = useMutation({
    mutationFn: (todo: PostedTodos) => todosAPI.postTodo(todo, accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  const markTodoComplete = useMutation({
    mutationFn: (id: number) => todosAPI.markCompleted(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  const updateTodo = useMutation({
    mutationFn: (data: { id: number; todo: PostedTodos }) =>
      todosAPI.updateTodo(data.id, data.todo, accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  const deleteTodo = useMutation({
    mutationFn: (id: number) => todosAPI.deleteTodo(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  return {
    todos,
    isLoading,
    error,
    total,
    completedTotal,

    addTodo,
    updateTodo,
    deleteTodo,
    markTodoComplete,
    refetchTodos,
  };
};
