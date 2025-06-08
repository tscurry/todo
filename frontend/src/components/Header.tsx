import * as React from 'react';
import { Forward, Menu, MenuClose } from './Icons';
import { handleOutsideClick } from '../utils/useClickOutside';
import { OverlayButtons } from './Buttons';
import { AuthOverlay, CreateListOverlay } from './Overlay';
import { useAuthentication } from '../hooks/useAuth';
import { useLists } from '../hooks/useLists';
import Lists from './Lists';
import { useTodos } from '../hooks/useTodos';
import { ListItems } from '../utils/types';
import { useListId } from '../context/ListContext';
import { useAuth } from '../context/AuthContext';

export const AuthHeader = (props: { isResponsive?: boolean; isSidebarOpen?: boolean }) => {
  const [isOverlayOpen, setIsOverlayOpen] = React.useState(false);
  const [toggleAccount, setToggleAccount] = React.useState(false);

  const headerRef = React.useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { logout, errorSetters } = useAuthentication();

  handleOutsideClick(headerRef, () => setIsOverlayOpen(false));

  const handleLogut = () => {
    logout.mutate();
    // setIsOverlayOpen(false);
  };

  return (
    <>
      <div
        className={`${!props.isResponsive ? 'bg-white border-b-grey border-b' : ''} auth-header w-full flex items-center`}
      >
        <div
          className={`${!props.isResponsive ? 'w-[85%] justify-end' : ''} mx-auto bg-white flex items-center`}
        >
          {!user ? (
            <div className={`${props.isResponsive ? 'bg-grey' : ''} group`}>
              <button
                className={`${props.isResponsive ? 'bg-white' : 'bg-grey'} group py-2 px-5 bg-grey rounded-lg group-hover:bg-black transition-all duration-400`}
                onClick={() => {
                  setIsOverlayOpen(!isOverlayOpen);
                  errorSetters.resetErrors();
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
                  Signed in as: {user.username}
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

  const { selectedListId, setSelectedListId } = useListId();
  const { lists } = useLists();
  const { total, completedTotal } = useTodos(selectedListId);
  const { user } = useAuth();

  handleOutsideClick(headerRef, () => setIsOpen(false));

  const getCompleted = () => {
    setSelectedListId(0);
    setIsOpen(false);
  };

  const getAllTodos = () => {
    setSelectedListId(-1);
    setIsOpen(false);
  };

  const getListTodos = (id: number) => {
    setSelectedListId(id);
    setIsOpen(false);
  };
  React.useEffect(() => {
    setSelectedListId(-1);
  }, []);

  return (
    <div className="lgmd:hidden header header-shadow flex items-center w-full h-[90%] transition-all relative">
      {!isOpen && (
        <div className="w-[90%] flex justify-between m-auto items-center">
          <div>
            <AuthHeader isResponsive={true} isSidebarOpen={isOverlayOpen} />
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
                className={`${selectedListId === -1 ? 'bg-grey' : ''} transition-all duration-300 flex justify-between items-center p-2 xlmd:p-3 rounded-lg cursor-pointer mb-[8px] xlmd:mb-[6px]`}
                onClick={getAllTodos}
              >
                <div className="items-center flex">
                  <p className="text-xl">🏠</p>
                  <p className="ml-3 text-sm xlmd:text-[16px]">Home</p>
                </div>

                <p
                  className={`${selectedListId === -1 ? 'bg-white' : 'bg-grey'} transition-all duration-300 p-1 rounded-lg text-center text-sm w-9`}
                >
                  {total}
                </p>
              </div>
              {isListOpen &&
                user &&
                lists.map((item: ListItems) => (
                  <div key={item.list_id} onClick={() => getListTodos(item.list_id)}>
                    <Lists list={item} selectedList={selectedListId} />
                  </div>
                ))}
              <div
                className={`${selectedListId === 0 ? 'bg-grey' : ''} transition-all duration-300 flex justify-between items-center p-2 xlmd:p-3 rounded-lg cursor-pointer mb-[8px] xlmd:mb-[6px]`}
                onClick={getCompleted}
              >
                <div className="items-center flex">
                  <div className={`rounded-[7px] border-[2px] p-[10px] border-[#000]`}></div>
                  <p className="ml-3 text-sm xlmd:text-[16px]">Completed</p>
                </div>

                <p
                  className={`${selectedListId === 0 ? 'bg-white' : 'bg-grey'} transition-all duration-300 p-1 rounded-lg text-center text-sm w-9`}
                >
                  {completedTotal}
                </p>
              </div>
            </div>
            <OverlayButtons
              onClick={() => {
                setIsOpen(false);
                user ? setIsOverlayOpen(!isOverlayOpen) : setIsAuthOverlayOpen(!isAuthOverlayOpen);
              }}
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
            className="fixed top-0 left-0 right-0 bottom-0 z-[998] bg-black opacity-50 overflow-hidden"
            onClick={() => setIsOverlayOpen(false)}
          ></div>
          <div className="absolute left-0 right-0 bottom-0 top-56 z-[999]">
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
