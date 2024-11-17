import * as React from 'react';
import { Forward, Menu, MenuClose } from './Icons';
import { handleOutsideClick } from '../utils/useClickOutside';
import { OverlayButtons } from './Buttons';
import { AuthOverlay, CreateListOverlay } from './Overlay';
import { useLoading } from '../context/LoadingContext';
import Lists from './Lists';
import { useAuth } from '../context/AuthContext';
import { createTempUid } from '../utils/createTempUid';
import { useList } from '../context/ListContext';
import { useTodo } from '../context/TodoContext';

export const AuthHeader = (props: { isResponsive?: boolean }) => {
  const [isOverlayOpen, setIsOverlayOpen] = React.useState(false);
  const [toggleAccount, setToggleAccount] = React.useState(false);
  const headerRef = React.useRef<HTMLDivElement>(null);

  const { isAuthenticated, user, logout, resetErrors } = useAuth();
  const { setLoading } = useLoading();

  handleOutsideClick(headerRef, () => setIsOverlayOpen(false));

  const handleLogut = async () => {
    setLoading(true);

    const response = await logout();
    if (response) {
      setIsOverlayOpen(false);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!isAuthenticated) {
      createTempUid();
    }
  }, [isAuthenticated]);

  return (
    <>
      <div
        className={`${!props.isResponsive ? 'bg-white border-b-grey border-b' : ''} auth-header w-full flex items-center`}
      >
        <div
          className={`${!props.isResponsive ? 'w-[85%] justify-end' : ''} mx-auto bg-white flex items-center`}
        >
          {!isAuthenticated ? (
            <div className={`${props.isResponsive ? 'bg-grey' : ''} group`}>
              <button
                className={`${props.isResponsive ? 'bg-white' : 'bg-grey'} group py-2 px-5 bg-grey rounded-lg group-hover:bg-black transition-all duration-400`}
                onClick={() => {
                  setIsOverlayOpen(!isOverlayOpen);
                  resetErrors();
                }}
              >
                <p className="group-hover:text-white text-sm">Login/Signup</p>
              </button>
            </div>
          ) : (
            <div className={`${props.isResponsive ? 'bg-grey' : ''} flex items-center`}>
              <div
                className={`${props.isResponsive ? 'cursor-pointer' : 'cursor-auto'} flex items-center relative`}
                onClick={() => props.isResponsive && setToggleAccount(!toggleAccount)}
              >
                <p
                  className={`${props.isResponsive ? 'mr-1' : 'mr-2'} sm:text-sm text-blue text-xs`}
                >
                  Signed in as: {user}
                </p>
                {props.isResponsive && (
                  <Forward
                    className={`${toggleAccount ? 'rotate-90' : 'rotate-270'} h-[0.9em] text-blue transform transition-all duration-400`}
                  />
                )}
                {toggleAccount && (
                  <>
                    <div
                      className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black opacity-50"
                      onClick={() => setToggleAccount(false)}
                    ></div>
                    <div className="absolute top-12 w-full rounded-lg bg-white p-5 z-[999]">
                      <div className="flex items-center justify-center">
                        <button
                          className="text-sm py-2 px-5 rounded-lg bg-black text-white"
                          onClick={handleLogut}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {!props.isResponsive && (
                <div className="group ml-5">
                  <button
                    className={`${props.isResponsive ? 'bg-white' : 'bg-grey'} group-hover:text-white text-sm group py-2 px-5 rounded-lg group-hover:bg-black transition-all duration-400`}
                    onClick={handleLogut}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {isOverlayOpen && (
        <>
          <div
            className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black opacity-50 overflow-hidden"
            onClick={() => setIsOverlayOpen(false)}
          ></div>
          <div className="absolute left-[55%] z-[999] top-24">
            <div
              className="relative -left-[55%]"
              ref={headerRef}
              onClick={(e) => e.stopPropagation()}
            >
              <AuthOverlay close={() => setIsOverlayOpen(false)} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isListOpen, setIsListOpen] = React.useState(true);
  const [isOverlayOpen, setIsOverlayOpen] = React.useState(false);
  const [isAuthOverlayOpen, setIsAuthOverlayOpen] = React.useState(false);

  const authOverlayRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);

  const { getTotalTodos, getUserTodos, setTodos, totalTodos } = useTodo();
  const {
    setListTodos,
    setSelectedList,
    fetchLists,
    getCompletedCount,
    getUserListTodos,
    selectedList,
    lists,
  } = useList();

  handleOutsideClick(headerRef, () => setIsOpen(false));

  const { isAuthenticated } = useAuth();

  const openSignup = () => {
    setIsOpen(false);
    setIsAuthOverlayOpen(!isAuthOverlayOpen);
  };

  // when list item is selected
  const handleListSelect = async (item: number) => {
    setIsOpen(false);
    setSelectedList(item);

    const todos = await getUserListTodos(item);
    if (todos) {
      setTodos([]);
      setListTodos(todos);
    }
  };

  const handleSelectListComplete = async () => {
    setIsOpen(false);
    setSelectedList(0);
    const todos = await getCompletedCount(true);

    if (todos) {
      setTodos([]);
      setListTodos(todos);
    }
  };

  const getAllTodos = async () => {
    setIsOpen(false);
    setSelectedList(-1);
    setListTodos([]);
    await getUserTodos();
    await getTotalTodos();
  };

  React.useEffect(() => {
    fetchLists();
    getCompletedCount();
    getAllTodos();
  }, [isAuthenticated]);

  return (
    <div className="lgmd:hidden header header-shadow flex items-center w-full h-[90%] transition-all relative">
      {!isOpen && (
        <div className="w-[90%] flex justify-between m-auto items-center">
          <div>
            <AuthHeader isResponsive={true} />
          </div>
          <Menu onClick={() => setIsOpen(!isOpen)} />
        </div>
      )}
      {isOpen && (
        <>
          <div
            className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black opacity-50"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="fixed bottom-0 h-full bg-white right-0 z-[996] w-[300px] p-8">
            <div
              className="rounded-lg flex mt-20 items-center justify-between"
              onClick={() => setIsListOpen(!isListOpen)}
            >
              <h1 className="font-semibold text-xl">Lists</h1>
              <div
                className={`${isListOpen ? 'rotate-270' : 'rotate-90'} transform transition-all duration-400`}
              >
                <Forward />
              </div>
            </div>
            <div className="max-h-[400px] h-auto my-5 overflow-y-scroll">
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
              {isListOpen &&
                isAuthenticated &&
                lists.map((item) => (
                  <div key={item.list_id} onClick={() => handleListSelect(item.list_id)}>
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
                  0
                </p>
              </div>
            </div>
            <OverlayButtons
              onClick={openSignup}
              buttonText="Create a new list"
              color="#000"
              textColor="#fff"
              parent="header"
            />
          </div>
          <div className="w-full fixed flex justify-end right-5 z-[997] m-auto">
            <MenuClose onClick={() => setIsOpen(!isOpen)} />
          </div>
        </>
      )}
      {isOverlayOpen && (
        <>
          <div
            className="fixed top-0 left-0 right-0 bottom-0 z-[998] bg-black opacity-50"
            onClick={() => setIsOverlayOpen(false)}
          ></div>
          <div className="flex items-center justify-center h-screen w-full m-auto">
            <div
              ref={overlayRef}
              className="z-[999] h-[300px] mx-auto w-[350px] xsmd:w-[400px]"
              onClick={(e) => e.stopPropagation()}
            >
              <CreateListOverlay close={() => setIsOverlayOpen(false)} />
            </div>
          </div>
        </>
      )}
      {isAuthOverlayOpen && (
        <>
          <div
            className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black opacity-50 overflow-hidden"
            onClick={() => setIsAuthOverlayOpen(false)}
          ></div>
          <div className="absolute left-[55%] z-[999] top-24">
            <div
              className="relative -left-[55%]"
              ref={authOverlayRef}
              onClick={(e) => e.stopPropagation()}
            >
              <AuthOverlay close={() => setIsAuthOverlayOpen(false)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
