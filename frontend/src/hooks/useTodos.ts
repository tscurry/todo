import * as todosAPI from '../api/todo';
import * as listAPI from '../api/list';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PostedTodos } from '../utils/types';

export const useTodos = (listId: number) => {
  const queryClient = useQueryClient();

  const getTodos = async () => {
    let todos;

    if (listId !== undefined && listId !== 0) {
      if (listId === -1) {
        todos = await todosAPI.getTodos();
      } else {
        todos = await listAPI.getListTodos(listId);
      }
    }

    const total = await todosAPI.getTotalCount();
    const completed = await todosAPI.getCompleted();
    return { todos, total, completed };
  };

  const {
    data,
    isLoading,
    error,
    refetch: refetchTodos,
  } = useQuery({
    queryKey: ['todos', listId ?? 'all'],
    queryFn: () => getTodos(),
  });

  const todos = listId === 0 ? data?.completed?.completedTodos ?? [] : data?.todos ?? [];
  const total = data?.total ?? 0;
  const completedTotal = data?.completed?.sum?.count ?? 0;

  const addTodo = useMutation({
    mutationFn: (todo: PostedTodos) => todosAPI.postTodo(todo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  const markTodoComplete = useMutation({
    mutationFn: (id: number) => todosAPI.markCompleted(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  const updateTodo = useMutation({
    mutationFn: (data: { id: number; todo: PostedTodos }) =>
      todosAPI.updateTodo(data.id, data.todo),
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
