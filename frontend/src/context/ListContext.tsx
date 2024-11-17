/* eslint-disable no-unused-vars */
import * as React from 'react';
import { ContextProviderProps, ListItems, Todos } from '../utils/types';
import { getListTodos, getUserLists, postNewList } from '../api/list';
import { getCompleted } from '../api/todo';

type ListContextProps = {
  lists: ListItems[];
  selectedListTodos: Todos[];
  completedCount: number;
  totalCount: number;
  selectedList: number;
  setSelectedList: (selectedList: number) => void;
  setTotalCount: (count: number) => void;
  setListTodos: (todos: Todos[]) => void;
  setLists: (lists: ListItems[]) => void;
  fetchLists: () => Promise<void>;
  getCompletedCount: (selected?: boolean) => Promise<Todos[]>;
  getUserListTodos: (id: number) => Promise<Todos[] | undefined>;
  createNewList: (name: string) => Promise<boolean | undefined>;
};

const ListContext = React.createContext<ListContextProps | undefined>(undefined);

const ListProvider = ({ children }: ContextProviderProps) => {
  const [selectedList, setSelectedList] = React.useState<number>(-1);
  const [completedCount, setCompletedCount] = React.useState<number>(0);
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const [selectedListTodos, setSelectedListTodos] = React.useState<Todos[]>([]);
  const [lists, setLists] = React.useState<ListItems[]>([]);

  const fetchLists = async () => {
    const list = await getUserLists();
    list ? setLists(list) : setLists([]);
  };

  const createNewList = async (name: string) => {
    const newList = await postNewList(name);
    if (newList) return true;
    else return false;
  };

  const getCompletedCount = async (selected?: boolean) => {
    const complete = await getCompleted();
    if (complete) setCompletedCount(complete.sum?.count);

    if (selected) return complete.completedTodos;
  };

  const getUserListTodos = async (id: number) => {
    const todos = await getListTodos(id);

    if (todos) return todos;
  };

  React.useEffect(() => {
    setSelectedList(-1);
  }, []);

  return (
    <ListContext.Provider
      value={{
        lists,
        completedCount,
        selectedListTodos,
        selectedList,
        setSelectedList,
        totalCount,
        setTotalCount,
        setListTodos: setSelectedListTodos,
        getUserListTodos,
        setLists,
        fetchLists,
        createNewList,
        getCompletedCount,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export const useList = () => {
  const context = React.useContext(ListContext);
  if (!context) {
    throw new Error('useList must be used within a AuthProvider');
  }
  return context;
};

export default ListProvider;
