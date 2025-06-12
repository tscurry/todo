import * as React from 'react';
import * as listAPI from '../api/list';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

export const useLists = () => {
  const [selectedListId, setSelectedListId] = React.useState<number>(-1);
  const queryClient = useQueryClient();

  const { accessToken } = useAuth();

  const {
    data: lists,
    isLoading,
    error,
    refetch: refetchLists,
  } = useQuery({
    queryKey: ['lists'],
    queryFn: () => listAPI.getUserLists(accessToken),
    enabled: !!accessToken,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const createList = useMutation({
    mutationFn: (name: string) => listAPI.postNewList(name, accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });

  return {
    lists,
    isLoading,
    error,
    createList,
    selectedListId,
    setSelectedListId,
    refetchLists,
  };
};
