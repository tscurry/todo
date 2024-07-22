import { Todos } from '../utils/types';

// get todos
export const getTodos = async () => {
  const temp_uid = JSON.parse(localStorage.getItem('temp_uid')!) || '';

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos?temp_uid=${temp_uid}`, {
      method: 'GET',
      credentials: 'include',
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// create a todo
export const postTodo = async (todoData: Todos) => {
  try {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: todoData.title,
        priority: todoData.priority,
        due_date: todoData.due_date,
        temp_uid: todoData.temp_uid,
      }),
      credentials: 'include',
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// update a todo
export const updateTodo = async (id: number, todoData: Todos) => {
  try {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: todoData.title,
        priority: todoData.priority,
        due_date: todoData.due_date,
      }),
      credentials: 'include',
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// delete a todo
export const deleteTodo = async (id: number) => {
  try {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(error);
  }
};
