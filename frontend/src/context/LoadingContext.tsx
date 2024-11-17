/* eslint-disable no-unused-vars */
import * as React from 'react';
import { ContextProviderProps } from '../utils/types';

type LoadingContextProps = {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
};

const LoadingContext = React.createContext<LoadingContextProps | undefined>(undefined);

const LoadingProvider = ({ children }: ContextProviderProps) => {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading: setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = React.useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export default LoadingProvider;
