import * as React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Forward, MenuClose } from './Icons';
import { OverlayButtons } from './Buttons';
import { DatePickerCalendar, TimePicker } from './index';
import { ListItems, Todos } from '../utils/types';
import dayjs, { Dayjs } from 'dayjs';
import { ClipLoader } from 'react-spinners';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useLists } from '../hooks/useLists';
import { useTodos } from '../hooks/useTodos';
import Lists from './Lists';
import { useListId } from '../context/ListContext';
import { useAuth } from '../context/AuthContext';
import { useAuthentication } from '../hooks/useAuth';

// add animations at the end

const Overlay = (props: { todo?: Todos; close: () => void }) => {
  const [selectedOverlayList, setSelectedOverlayList] = React.useState<ListItems>();
  const [selectedOption, setSelectedOption] = React.useState('date');
  const [todoTitle, setTodoTitle] = React.useState('');
  const [listTitle, setListTitle] = React.useState('');
  const [isListInputVisible, setIsListInputVisible] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(Boolean(props.todo));
  const [toggleDate, setToggleDate] = React.useState(true);

  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<Dayjs | null>(null);

  const { selectedListId, setSelectedListId } = useListId();
  const { lists, createList, refetchLists } = useLists();
  const { updateTodo, addTodo } = useTodos(selectedListId);
  const { user } = useAuth();

  const handleChange = (newDateTime: Dayjs | null, update?: string) => {
    if (update === 'date') setSelectedDate(newDateTime);
    else setSelectedTime(newDateTime);
    setIsEditing(false);
  };

  const handleCreateList = async (name: string) => {
    const newList = await createList.mutateAsync(name);
    if (newList) {
      setIsListInputVisible(false);
    }
  };

  const findSelectedList = () => {
    const preselected = lists?.filter((item: ListItems) => props.todo?.color === item.color);
    preselected && setSelectedOverlayList(preselected[0]);
  };

  // make sure time is > current time
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedTime && selectedDate && todoTitle) {
      const combinedDate = selectedDate
        .hour(selectedTime.hour())
        .minute(selectedTime.minute())
        .format('YYYY-MM-DDTHH:mm:ss');

      try {
        if (props.todo) {
          const update = await updateTodo.mutateAsync({
            id: props.todo.todo_id,
            todo: {
              title: todoTitle,
              due_date: combinedDate,
              list_name: selectedOverlayList?.name,
            },
          });

          if (update) {
            await refetchLists();
            props.close();
          }
        } else {
          const post = await addTodo.mutateAsync({
            title: todoTitle,
            due_date: combinedDate,
            list_name: selectedOverlayList?.name,
          });

          if (post) {
            setSelectedListId(-1);
            await refetchLists();
            props.close();
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  React.useEffect(() => {
    if (isEditing && props.todo) {
      setTodoTitle(props.todo.title);
      setSelectedDate(dayjs(props.todo.due_date));
      setSelectedTime(dayjs(props.todo.due_date));
    }
    findSelectedList();
  }, [isEditing, props.todo]);

  return (
    <motion.form
      method="post"
      onSubmit={handleSubmit}
      className="rounded-lg bg-white w-full custom-shadow overflow-y-scroll p-2"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: -10 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center bg-grey rounded-xl p-2.5">
        <div
          style={{
            borderColor: selectedOverlayList ? selectedOverlayList.color : '#b2b2b2',
          }}
          className={`rounded-[7px] border-[2px] p-[10px] transition-all duration-400`}
        ></div>
        <input
          type="text"
          value={todoTitle}
          onChange={(e) => setTodoTitle(e.target.value)}
          name="todo"
          placeholder="Todo title"
          id="todo"
          className="w-full bg-grey rounded-xl pl-3 focus:outline-none"
        />
        {selectedDate || isEditing ? (
          <div className="bg-white rounded-xl py-1 px-2 min-w-max ml-2">
            <p className="text-[10px] text-light-grey font-medium">
              {selectedDate?.format('D MMMM')}
            </p>
          </div>
        ) : null}

        {selectedTime || isEditing ? (
          <div className="bg-white rounded-xl py-1 px-2 min-w-max ml-1">
            <p className="text-[10px] text-light-grey font-medium">
              {selectedTime?.format('h:mm A')}
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex justify-between my-2 gap-2 ">
        <div
          className={`${selectedOption === 'list' ? 'border-[2px] border-black' : 'border-[0.5px] border-light-grey'} rounded-lg p-2.5 flex items-center relative w-full cursor-pointer box-border`}
          onClick={() => setSelectedOption('list')}
        >
          <span
            style={{
              borderColor: selectedOverlayList ? selectedOverlayList.color : '#b2b2b2',
            }}
            className={`rounded-[7px] border-[2px] p-2.5 transition-all duration-400`}
          />
          <p className="pl-3 pr-5 w-full">
            {!selectedOverlayList ? 'No List' : selectedOverlayList.name}
          </p>
          <div className="absolute right-3">
            <Forward
              className={`${selectedOption === 'list' ? 'rotate-270' : 'rotate-90'} transform transition-all duration-400`}
            />
          </div>
        </div>
        <div
          className={`${selectedOption === 'date' ? 'bg-black' : ''} rounded-lg border-[0.5px] w-[55px] cursor-pointer flex items-center justify-center`}
          onClick={() => setSelectedOption('date')}
        >
          <Calendar className={`${selectedOption === 'date' ? 'text-white' : ''}`} />
        </div>
      </div>

      <div
        className={`${selectedOption === 'list' ? 'max-h-[240px] xlsm:max-h-[290px]' : 'max-h-[300px]'} overflow-y-scroll my-4 transition-all duration-400 h-auto`}
      >
        {selectedOption === 'list' &&
          lists.map((item: ListItems) => (
            <div key={item.list_id} onClick={() => setSelectedOverlayList(item)}>
              <Lists list={item} selectedList={selectedOverlayList?.list_id} />
            </div>
          ))}
      </div>
      {user && isListInputVisible && selectedOption === 'list' && (
        <div className="flex items-center justify-between">
          <div className="bg-grey flex w-full rounded-lg p-2.5 border-[0.5px]">
            <div
              className={`rounded-[7px] border-[2px] p-[10px] transition-all duration-400 border-light-grey`}
            ></div>
            <input
              type="text"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              name="create-list"
              placeholder="List name"
              className="pl-3 bg-grey w-full focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="py-2 px-5 bg-blue ml-4 rounded-lg"
            onClick={() => handleCreateList(listTitle)}
          >
            <p className="text-white max-sm:text-sm">Save</p>
          </button>
        </div>
      )}
      {!user && isListInputVisible && selectedOption === 'list' && (
        <p className="text-red italic ml-2">You must have an account to create lists.</p>
      )}
      {selectedOption === 'list' && (
        <>
          <div className="mt-2" onClick={() => setIsListInputVisible(!isListInputVisible)}>
            <OverlayButtons
              buttonText="Create new list"
              color="#0369fb"
              textColor="#fff"
              type="button"
            />
          </div>
        </>
      )}
      <div className="max-h-[320px] md:max-h-none overflow-y-scroll w-full">
        {selectedOption === 'date' && (
          <>
            {toggleDate ? (
              <DatePickerCalendar selectedDate={selectedDate} handleChange={handleChange} />
            ) : (
              <div className="w-full">
                <TimePicker
                  selectedTime={selectedTime}
                  selectedDate={selectedDate}
                  handleChange={handleChange}
                />
              </div>
            )}
            <OverlayButtons
              type="button"
              buttonText={!toggleDate ? 'Set date' : 'Set time'}
              color="#0369fb"
              textColor="#fff"
              onClick={() => setToggleDate(!toggleDate)}
            />
          </>
        )}
      </div>
      <OverlayButtons
        buttonText={`${props.todo ? 'Update todo' : 'Add todo'}`}
        color="#000"
        textColor="#fff"
        disabled={selectedDate && selectedTime && todoTitle ? false : true}
        type="submit"
      />
    </motion.form>
  );
};

export const AuthOverlay = (props: { close: () => void }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordVerify, setPasswordVerify] = React.useState('');
  const [isLogin, setIsLogin] = React.useState(true);

  const auth = useAuthentication();
  const { setIsLoading } = useAuth();

  const resetVariables = () => {
    setPassword('');
    setUsername('');
    setPasswordVerify('');
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);

    if (isLogin) {
      const response = await auth.login.mutateAsync({ username, password });

      if (response.userError || response.passwordError) {
        auth.errorSetters.setUserError(!!response.userError);
        auth.errorSetters.setPasswordError(!!response.passwordError);
        return;
      }

      if (response.message) {
        props.close();
        setIsLoading(false);
      } else {
        throw new Error('There was an unexpected error while logging in');
      }
    } else {
      const response = await auth.signup.mutateAsync({ username, password });

      if (response.message) {
        await auth.login.mutateAsync({ username, password });
        props.close();
        setIsLoading(false);
      } else if (response.error) {
        auth.errorSetters.setSignupError(true);
      }
    }
  };

  // reset variables when changing view
  React.useEffect(() => {
    auth.errorSetters.resetErrors();
    resetVariables();
  }, [isLogin]);

  return (
    <div className="rounded-lg p-4 w-[320px] sm:w-[400px] xsmd:w-[500px] bg-white h-auto">
      <h1 className="font-semibold text-xl text-center my-2">
        {isLogin ? 'Login' : 'Create an account'}
      </h1>

      <form method="post" onSubmit={handleFormSubmit}>
        <div className="relative mt-10">
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`${auth.errorFlags.userError ? 'border-red' : ''} block px-2.5 pb-2.5 pt-4 w-full text-sm rounded-lg border border-light-grey focus:outline-none peer`}
            placeholder=" "
            required
          />
          <label
            className={`${
              auth.errorFlags.userError ? 'text-red' : ''
            } absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-90 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1`}
          >
            Username
          </label>
        </div>

        <div className="relative mt-5">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${!isLogin && passwordVerify.length && passwordVerify !== password ? 'border-red' : ''} ${auth.errorFlags.passwordError ? 'border-red' : ''} block px-2.5 pb-2.5 pt-4 w-full text-sm rounded-lg border border-light-grey focus:outline-none peer`}
            placeholder=" "
            required
          />
          <label
            className={`${auth.errorFlags.passwordError ? 'text-red' : ''} ${!isLogin && passwordVerify.length && passwordVerify !== password ? 'text-red' : ''} absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-90 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1`}
          >
            Password
          </label>
        </div>
        {isLogin && (
          <p
            className={`${auth.errorFlags.userError || auth.errorFlags.passwordError ? 'block' : 'hidden'} p-1 text-red text-[10px]`}
          >
            {auth.errorFlags.passwordError
              ? 'Password is incorrect. Please try again'
              : 'User does not exist. Please create an account to continue'}
          </p>
        )}

        {!isLogin && (
          <>
            <div className="relative mt-5">
              <input
                type="password"
                id="password"
                value={passwordVerify}
                onChange={(e) => setPasswordVerify(e.target.value)}
                className={`${!isLogin && passwordVerify.length && passwordVerify !== password ? 'border-red' : ''} block px-2.5 pb-2.5 pt-4 w-full text-sm rounded-lg border border-light-grey focus:outline-none peer`}
                placeholder=" "
                required
              />
              <label
                className={`${passwordVerify.length && passwordVerify !== password ? 'text-red' : ''} absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-90 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1`}
              >
                Verify Password
              </label>
              {passwordVerify.length > 0 && passwordVerify !== password ? (
                <p className="p-1 text-[10px] text-red">Passwords do not match</p>
              ) : null}
            </div>
            <p
              className={`${auth.errorFlags.signupError ? 'block' : 'hidden'} text-red text-[10px] p-1`}
            >
              User already exists. Select the option below to log in
            </p>
          </>
        )}

        <button
          type="submit"
          className="w-full p-4 bg-black text-white mt-10 rounded-lg disabled:opacity-10"
          disabled={
            isLogin
              ? !username.length || !password.length
              : !username.length || !password.length || password !== passwordVerify
          }
        >
          {isLogin ? 'Login' : 'Create account'}
        </button>
      </form>
      <div className="mt-5 p-2">
        <p className="text-center text-xs font-light">
          {isLogin ? `Don't have an account? ` : 'Already have an account? '}

          <span
            className="font-semibold hover:underline cursor-pointer text-xs"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Create an Account' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export const CreateListOverlay = (props: { close: () => void }) => {
  const [listTitle, setListTitle] = React.useState('');

  const { createList } = useLists();

  const createNewList = async (name: string) => {
    const response = await createList.mutateAsync(name);
    if (response) {
      props.close();
    }
  };

  return (
    <div className="bg-white rounded-lg p-3 custom-shadow">
      <div className="w-full">
        <div className="flex justify-end mt-1 mb-4">
          <MenuClose height="1.5em" onClick={props.close} className="cursor-pointer" />
        </div>
        <div className="flex items-center bg-grey rounded-xl p-2.5">
          <div
            className={`rounded-[7px] border-[2px] p-[10px] transition-all duration-400 border-light-grey`}
          ></div>
          <input
            type="text"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            name="create-list"
            placeholder="List name"
            className="w-full bg-grey rounded-xl pl-3 focus:outline-none"
          />
        </div>
        <div className="mb-2 mt-4" onClick={() => createNewList(listTitle)}>
          <OverlayButtons
            buttonText="Create new list"
            color="#000"
            textColor="#fff"
            disabled={!listTitle.length}
          />
        </div>
      </div>
    </div>
  );
};

export const GlobalLoadingOverlay = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const isLoading = isFetching > 0 || isMutating > 0;

  return isLoading ? (
    <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center z-[9999] bg-black bg-opacity-50">
      <ClipLoader size={50} color="#fff" />
    </div>
  ) : null;
};

export default Overlay;
