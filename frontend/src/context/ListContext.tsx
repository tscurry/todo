/* eslint-disable no-unused-vars */
import * as React from 'react';
import { ContextProviderProps, ListItems, Todos } from '../utils/types';
import { getCompleted } from '../api/todo';
import { getUserLists } from '../api/list';

type ListContextProps = {
  lists: ListItems[];
  selectedListTodos: Todos[];
  completedCount: number;
  totalCount: number;
  selectedList: number;
  getLists: () => Promise<void>;
  setSelectedList: (selectedList: number) => void;
  setTotalCount: (count: number) => void;
  setListTodos: (todos: Todos[]) => void;
  setLists: (lists: ListItems[]) => void;

  getCompletedCount: (selected?: boolean) => Promise<Todos[]>;
};

const ListContext = React.createContext<ListContextProps | undefined>(undefined);

const ListProvider = ({ children }: ContextProviderProps) => {
  const [selectedList, setSelectedList] = React.useState<number>(-1);
  const [completedCount, setCompletedCount] = React.useState<number>(0);
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const [selectedListTodos, setSelectedListTodos] = React.useState<Todos[]>([]);
  const [lists, setLists] = React.useState<ListItems[]>([]);

  const getCompletedCount = async (selected?: boolean) => {
    const complete = await getCompleted();
    if (complete) setCompletedCount(complete.sum?.count);

    if (selected) return complete.completedTodos;
  };

  const getLists = async () => {
    const list = await getUserLists();
    list ? setLists(list) : setLists([]);
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
        totalCount,
        setSelectedList,
        getLists,
        setTotalCount,
        setListTodos: setSelectedListTodos,
        setLists,
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
