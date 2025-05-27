/* eslint-disable no-unused-vars */
import * as React from 'react';
import { ContextProviderProps } from '../utils/types';

type ListContextProps = {
  selectedListId: number;
  setSelectedListId: (id: number) => void;
};

const ListContext = React.createContext<ListContextProps | undefined>(undefined);

const ListProvider = ({ children }: ContextProviderProps) => {
  const [selectedListId, setSelectedListId] = React.useState<number>(-1);

  return (
    <ListContext.Provider
      value={{
        selectedListId,
        setSelectedListId,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export const useListId = () => {
  const context = React.useContext(ListContext);
  if (!context) {
    throw new Error('useList must be used within a AuthProvider');
  }
  return context;
};

export default ListProvider;
