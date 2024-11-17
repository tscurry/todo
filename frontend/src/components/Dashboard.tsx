import * as React from 'react';
import { CreateNewList } from './Buttons';
import { useAuth } from '../context/AuthContext';
import Lists from './Lists';
import { useList } from '../context/ListContext';
import { useTodo } from '../context/TodoContext';

const Dashboard = () => {
  const { setTodos, getUserTodos, getTotalTodos, totalTodos, todoUpdated } = useTodo();
  const { isAuthenticated } = useAuth();
  const {
    getCompletedCount,
    fetchLists,
    getUserListTodos,
    setListTodos,
    setSelectedList,
    selectedList,
    lists,
    completedCount,
  } = useList();

  const getAllTodos = async () => {
    setSelectedList(-1);
    setListTodos([]);
    await getUserTodos();
    await getTotalTodos();
  };

  const getListItems = async (id: number) => {
    setSelectedList(id);

    const todos = await getUserListTodos(id);
    if (todos) {
      setTodos([]);
      setListTodos(todos);
    }
  };

  const handleSelectListComplete = async () => {
    setSelectedList(0);
    const todos = await getCompletedCount(true);

    if (todos) {
      setTodos([]);
      setListTodos(todos);
    }
  };

  React.useEffect(() => {
    fetchLists();
    getCompletedCount();
    getAllTodos();
  }, [isAuthenticated]);

  React.useEffect(() => {
    getTotalTodos();
  }, [todoUpdated]);

  return (
    <div className="dashboard hidden lgmd:block bg-white shadow-sm">
      <div className="py-10 px-5 h-full overflow-y-scroll">
        <h1 className="font-semibold text-2xl mb-10">Lists</h1>
        <div
          className={`${selectedList === -1 ? 'bg-grey' : ''} transition-all duration-300 flex justify-between items-center p-2 xlmd:p-3 rounded-lg cursor-pointer mb-[8px] xlmd:mb-[6px]`}
          onClick={getAllTodos}
        >
          <div className="items-center flex">
            <p className="text-xl">🏠</p>
            <p className="ml-3 text-sm xlmd:text-[16px]">Home</p>
          </div>

          <p
            className={`${selectedList === -1 ? 'bg-white' : 'bg-grey'} transition-all duration-300 p-1 rounded-lg text-center text-sm w-9`}
          >
            {totalTodos}
          </p>
        </div>

        {isAuthenticated &&
          lists.map((item) => (
            <div key={item.list_id} onClick={() => getListItems(item.list_id)}>
              <Lists list={item} selectedList={selectedList} />
            </div>
          ))}

        <div
          className={`${selectedList === 0 ? 'bg-grey' : ''} transition-all duration-300 flex justify-between items-center p-2 xlmd:p-3 rounded-lg cursor-pointer mb-[8px] xlmd:mb-[6px]`}
          onClick={handleSelectListComplete}
        >
          <div className="items-center flex">
            <div className={`rounded-[7px] border-[2px] p-[10px] border-[#000]`}></div>
            <p className="ml-3 text-sm xlmd:text-[16px]">Completed</p>
          </div>

          <p
            className={`${selectedList === 0 ? 'bg-white' : 'bg-grey'} transition-all duration-300 p-1 rounded-lg text-center text-sm w-9`}
          >
            {completedCount}
          </p>
        </div>
        <div className="my-10">
          <CreateNewList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
