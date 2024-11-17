export const getUserLists = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/lists`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    return data.lists;
  } catch (error) {
    console.error(error);
  }
};

export const getListTodos = async (id: number) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/lists/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await response.json();
    return data.todos;
  } catch (error) {
    console.error(error);
  }
};

export const postNewList = async (name: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
      credentials: 'include',
    });
    const data = await response.json();
    return data.listId;
  } catch (error) {
    console.error(error);
  }
};
