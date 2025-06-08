import { PostedTodos } from '../utils/types';

export const getTotalCount = async (token: string | null) => {
  const temp_uid = JSON.parse(localStorage.getItem('temp_uid')!) || '';

  try {
    if (temp_uid) {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/todos/total?temp_uid=${temp_uid}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );
      const data = await response.json();
      return data.count;
    } else {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/total`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data.count;
    }
  } catch (error) {
    console.error(error);
  }
};

//get completed todos
export const getCompleted = async (token: string | null) => {
  const temp_uid = JSON.parse(localStorage.getItem('temp_uid')!) || '';

  try {
    if (temp_uid) {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/todos/completed?temp_uid=${temp_uid}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );
      return await response.json();
    } else {
      const reponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/completed`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return await reponse.json();
    }
  } catch (error) {
    console.error(error);
  }
};

// get todos
export const getTodos = async (token: string | null) => {
  const temp_uid = JSON.parse(localStorage.getItem('temp_uid')!) || '';

  try {
    if (temp_uid) {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/todos?temp_uid=${temp_uid}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      const data = await response.json();
      return data.todos;
    } else {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data.todos;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// create a todo
export const postTodo = async (todoData: PostedTodos, token: string | null) => {
  const temp_uid = JSON.parse(localStorage.getItem('temp_uid')!) || '';

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: todoData.title,
        due_date: todoData.due_date,
        temp_uid: temp_uid,
        list_name: todoData.list_name,
      }),
      credentials: 'include',
    });

    if (response.status === 201) {
      return 'succesfully added a new todo';
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// update a todo
export const updateTodo = async (todo_id: number, todoData: PostedTodos, token: string | null) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/${todo_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: todoData.title,
        due_date: todoData.due_date,
        list_name: todoData.list_name,
      }),
      credentials: 'include',
    });
    if (response.status === 200) {
      return 'success';
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// mark as completed
export const markCompleted = async (id: number) => {
  const temp_uid = JSON.parse(localStorage.getItem('temp_uid')!) || '';

  try {
    if (!temp_uid) {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/${id}/completed`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          is_completed: true,
        }),
      });

      if (response) {
        return 'success';
      }
    } else {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/${id}/completed`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          is_completed: true,
        }),
      });

      if (response) {
        return 'success';
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// delete a todo
export const deleteTodo = async (id: number) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/todos/${id}`, {
      method: 'DELETE',
    });

    if (response.status === 204) {
      return 'successfull todo deletion';
    }
  } catch (error) {
    console.error(error);
  }
};
