export const getUserLists = async (token: string | null) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/lists`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.lists;
  } catch (error) {
    console.error(error);
  }
};

export const getListTodos = async (id: number, token: string | null) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/lists/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      credentials: 'include',
    });

    const data = await response.json();
    return data.todos;
  } catch (error) {
    console.error(error);
  }
};

export const postNewList = async (name: string, token: string | null) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name }),
      credentials: 'include',
    });
    const data = await response.json();
    return data.listId;
  } catch (error) {
    console.error(error);
  }
};
