import * as React from 'react';
import { CreateNewList } from './Buttons';
import Lists from './Lists';
import { useLists } from '../hooks/useLists';
import { useAuth } from '../context/AuthContext';
import { ListItems } from '../utils/types';
import { useTodos } from '../hooks/useTodos';
import { useListId } from '../context/ListContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { selectedListId, setSelectedListId } = useListId();
  const { lists } = useLists();
  const { total, completedTotal } = useTodos(selectedListId);

  React.useEffect(() => {
    setSelectedListId(-1);
  }, []);

  return (
    <div className="dashboard hidden lgmd:block bg-white shadow-sm">
      <div className="py-10 px-5 h-full overflow-y-scroll">
        <h1 className="font-semibold text-2xl mb-10">Lists</h1>
        <div
          className={`${selectedListId === -1 ? 'bg-grey' : ''} transition-all duration-300 flex justify-between items-center p-2 xlmd:p-3 rounded-lg cursor-pointer mb-[8px] xlmd:mb-[6px]`}
          onClick={() => setSelectedListId(-1)}
        >
          <div className="items-center flex">
            <p className="text-xl">&#127968;</p>
            <p className="ml-3 text-sm xlmd:text-[16px]">Home</p>
          </div>

          <p
            className={`${selectedListId === -1 ? 'bg-white' : 'bg-grey'} transition-all duration-300 p-1 rounded-lg text-center text-sm w-9`}
          >
            {total}
          </p>
        </div>

        {user && lists
          ? lists.map((item: ListItems) => (
              <div key={item.list_id} onClick={() => setSelectedListId(item.list_id)}>
                <Lists list={item} selectedList={selectedListId} />
              </div>
            ))
          : null}

        <div
          className={`${selectedListId === 0 ? 'bg-grey' : ''} transition-all duration-300 flex justify-between items-center p-2 xlmd:p-3 rounded-lg cursor-pointer mb-[8px] xlmd:mb-[6px]`}
          onClick={() => setSelectedListId(0)}
        >
          <div className="items-center flex mr-1">
            <div className="text-xl">&#x2705;</div>
            <p className="ml-3 text-sm xlmd:text-[16px]">Completed</p>
          </div>

          <p
            className={`${selectedListId === 0 ? 'bg-white' : 'bg-grey'} transition-all duration-300 p-1 rounded-lg text-center text-sm w-9`}
          >
            {completedTotal}
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
