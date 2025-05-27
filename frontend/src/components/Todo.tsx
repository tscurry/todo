import * as React from 'react';
import { CheckboxFill, DotsVertical, Forward, TimeIcon } from './Icons';
import { AnimatePresence, motion } from 'framer-motion';
import { DotsDropdown } from './Buttons';
import { customGreeting } from '../utils/greetings';
import { handleOutsideClick } from '../utils/useClickOutside';
import { Todos } from '../utils/types';
import dayjs, { Dayjs } from 'dayjs';
import DatePickerCalendar from './DatePicker';
import Overlay from './Overlay';
import { useTodos } from '../hooks/useTodos';
import { useLists } from '../hooks/useLists';
import { useAuth } from '../hooks/useAuth';
import { useListId } from '../context/ListContext';

const Todo = () => {
  const [isChecked, setIsChecked] = React.useState(false);
  const [dropdownId, setDropdownId] = React.useState<number | null>(null);
  const [editId, setEditId] = React.useState<number | null>(null);
  const [toggleCalendar, setToggleCalendar] = React.useState(false);
  const [selectedTodo, setSelectedTodo] = React.useState<Todos>();
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(null);

  const { refetchLists } = useLists();
  const { selectedListId } = useListId();
  const { todos, deleteTodo, markTodoComplete } = useTodos(selectedListId);
  const { user } = useAuth();

  const overlayRef = React.useRef<HTMLDivElement>(null);
  const calendarRef = React.useRef<HTMLDivElement>(null);

  const formattedDate = selectedDate?.format('ddd DD MMM YYYY');
  const today = dayjs(new Date()).format('ddd DD MMM YYYY');

  handleOutsideClick(overlayRef, () => setEditId(null));
  handleOutsideClick(calendarRef, () => setToggleCalendar(false));

  const handleComplete = async (todo_: Todos) => {
    setSelectedTodo(todo_);
    setIsChecked(true);

    setTimeout(async () => {
      const mark = await markTodoComplete.mutateAsync(todo_.todo_id);
      await refetchLists();

      if (mark) {
        todos.filter((todo: Todos) => todo.todo_id !== todo_.todo_id);
        setIsChecked(false);
      }
    }, 900);
  };

  const handleChange = (newDate: Dayjs | null) => {
    setSelectedDate(newDate);
    setToggleCalendar(false);
  };

  const handleEdit = (todo_: Todos) => {
    setSelectedTodo(todo_);
    setDropdownId(null);
    setEditId(todo_.todo_id);
  };

  const handleDelete = async (todo_: Todos) => {
    setSelectedTodo(todo_);
    setIsChecked(true);
    setDropdownId(null);

    // reset values after line through animation
    setTimeout(async () => {
      const del = await deleteTodo.mutateAsync(todo_.todo_id);
      await refetchLists();

      if (del) {
        todos.filter((todo: Todos) => todo.todo_id !== todo_.todo_id);
        setIsChecked(false);
      }
    }, 900);
  };

  return (
    <div className="content mb-1 overflow-y-scroll pt-10 lgmd:pt-0">
      <div className="lgmd:mt-14 w-[90%] lg:w-[80%] mx-auto flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-xl xlsm:text-2xl">
            {user ? customGreeting(user) : customGreeting()}
          </h1>
          <p className="xlsm:text-lg text-[grey] mt-1 font-light">
            {formattedDate === today ? `Today, ${formattedDate}` : formattedDate}
            {selectedDate === null ? 'All Todos' : ''}
          </p>
        </div>
        <div
          className="bg-white py-2 pl-4 pr-12 ml-5 cursor-pointer rounded-lg flex items-center justify-between transition-all shadow-sm relative"
          onClick={() => setToggleCalendar(!toggleCalendar)}
          ref={calendarRef}
        >
          <p className="text-center max-xlsm:text-sm">
            {selectedDate?.format('ddd DD MMM YYYY') || 'No date'}
          </p>
          <div className="justify-end absolute right-3 bg-grey p-1 rounded">
            <Forward
              className={`${toggleCalendar ? 'rotate-270' : 'rotate-90'} transform transition-all duration-400`}
            />
          </div>
          {toggleCalendar && (
            <div
              className="absolute top-16 sm:top-12 right-0 bg-white rounded-lg border-none z-[9999] custom-shadow"
              onClick={(e) => e.stopPropagation()}
            >
              <DatePickerCalendar selectedDate={selectedDate} handleChange={handleChange} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 pb-5">
        {todos.filter((todo_: Todos) =>
          selectedDate !== null
            ? dayjs(todo_.due_date).format('ddd DD MMM YYYY') === formattedDate
            : todo_,
        ).length > 0 ? (
          <AnimatePresence>
            {todos
              .filter((todo_: Todos) =>
                selectedDate !== null
                  ? dayjs(todo_.due_date).format('ddd DD MMM YYYY') === formattedDate
                  : todo_,
              )
              .map((todo: Todos) => (
                <motion.div
                  key={todo.todo_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  // exit={{ opacity: 0 }}
                  className={`transition-all mb-2 bg-white p-2 rounded-lg w-[90%] lg:w-[80%] flex items-center mx-auto relative`}
                >
                  <div className="flex overflow-hidden items-center justify-between w-full p-1 relative">
                    <div
                      className={`${todo.is_completed ? 'pointer-events-none' : ''} flex items-center`}
                    >
                      {todo.is_completed ? (
                        <CheckboxFill />
                      ) : isChecked && selectedTodo?.todo_id === todo.todo_id ? (
                        <CheckboxFill onClick={() => setIsChecked(false)} />
                      ) : (
                        <div
                          className="rounded-[7px] border-[2px] p-[10px] transition-all duration-400 border-light-grey cursor-pointer"
                          onClick={() => handleComplete(todo)}
                        ></div>
                      )}
                      <p
                        className={`${isChecked && selectedTodo?.todo_id === todo.todo_id ? 'pointer-events-none' : ''} ml-[10px] max-md:text-[13px]`}
                      >
                        {todo.title}
                      </p>
                      {todo.color && (
                        <div className="bg-grey ml-4 p-1.5 rounded-lg">
                          <div
                            style={{ borderColor: todo.color }}
                            className="rounded-[5px] border-[1.5px] p-[7px]"
                          ></div>
                        </div>
                      )}
                    </div>
                    {isChecked && selectedTodo?.todo_id === todo.todo_id && (
                      <svg
                        className={`absolute left-8 transition-all h-[5px] ease-in-out top-1/2 transform -translate-y-1/2 w-full z-10`}
                        viewBox="0 0 100 5"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0 2 Q 10 5, 20 2 T 40 2 T 60 2 T 80 2 T 100 2"
                          stroke="black"
                          strokeWidth="2"
                          fill="transparent"
                          className="animate-squiggle"
                        />
                      </svg>
                    )}
                    <div className="flex">
                      <div className="rounded-md p-[6px] bg-grey mr-1">
                        <p className="font-medium text-[11px]">
                          {dayjs(todo.due_date).format('D MMM')}
                        </p>
                      </div>
                      <div className="flex items-center rounded-md p-[6px] bg-grey">
                        <TimeIcon />
                        <p className="ml-1 font-medium text-[11px]">
                          {dayjs(todo.due_date).format('h:mm A')}
                        </p>
                      </div>

                      <div
                        className={`${isChecked && selectedTodo?.todo_id === todo.todo_id ? 'pointer-events-none' : ''} bg-grey rounded-md p-1 flex ml-[6px] items-center justify-center cursor-pointer`}
                        onClick={() =>
                          setDropdownId((prevId) => (prevId === todo.todo_id ? null : todo.todo_id))
                        }
                      >
                        <DotsVertical />
                      </div>
                    </div>
                  </div>
                  {dropdownId === todo.todo_id && (
                    <div
                      className="absolute top-14 right-0 z-[999] h-auto bubble"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DotsDropdown
                        delete={() => handleDelete(todo)}
                        edit={() => handleEdit(todo)}
                        isMarkedComplete={todo.is_completed}
                      />
                    </div>
                  )}
                  {editId === todo.todo_id && (
                    <>
                      <div
                        className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black opacity-50"
                        onClick={() => setEditId(null)}
                      ></div>

                      <div
                        ref={overlayRef}
                        className="fixed z-[999] top-20 w-screen h-auto left-0 sm:w-[400px] sm:left-[20%] lgmd:w-[600px] xsmd:w-[450px] lg:left-[35%]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Overlay todo={todo} close={() => setEditId(null)} />
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
          </AnimatePresence>
        ) : (
          <div className="w-[90%] lg:w-[80%] flex items-center mx-auto mt-14">
            <p className="italic">
              {selectedDate
                ? `No todos found for ${formattedDate}`
                : 'No todos to display. Click create to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Todo;
