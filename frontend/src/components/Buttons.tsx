import * as React from 'react';
import { CreateIcon } from './Icons';
import Overlay, { AuthOverlay, CreateListOverlay } from './Overlay';
import { handleOutsideClick } from '../utils/useClickOutside';
import { ButtonProps } from '../utils/types';
import { useAuth } from '../context/AuthContext';

export const DotsDropdown = (props: {
  delete: () => void;
  edit: () => void;
  isMarkedComplete: boolean | undefined;
}) => {
  return (
    <div className=" bg-white rounded-lg p-2 shadow-md">
      {!props.isMarkedComplete && (
        <button className="font-medium hover:bg-grey py-2 px-3 rounded-lg" onClick={props.edit}>
          Edit
        </button>
      )}
      <button
        className="font-medium text-red hover:bg-grey rounded-lg py-2 px-3"
        onClick={props.delete}
      >
        Delete
      </button>
    </div>
  );
};

export const NewTask = () => {
  const [isOverlayOpen, setIsOverlayOpen] = React.useState(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  handleOutsideClick(overlayRef, () => setIsOverlayOpen(false));

  return (
    <div className="w-[90%] lg:w-[80%] m-auto">
      <div className="relative xsmd:w-[60%] w-full">
        <div
          className="z-[999] rounded-full py-3 px-4 bg-black cursor-pointer flex items-center"
          onClick={() => {
            setIsOverlayOpen(!isOverlayOpen);
          }}
        >
          <CreateIcon
            className={`${isOverlayOpen ? 'rotate-45' : 'rotate-0'} transform text-white transition-all duration-400`}
          />
          <p className="text-white font-light text-sm md:text-[16px]">&nbsp; Create a new todo</p>
        </div>
        {isOverlayOpen && (
          <>
            <div
              className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black opacity-50"
              onClick={() => setIsOverlayOpen(false)}
            ></div>
            <div ref={overlayRef} className="z-[999] w-full bottom-12 absolute">
              <Overlay close={() => setIsOverlayOpen(false)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const CreateNewList = () => {
  const [isOverlayOpen, setIsOverlayOpen] = React.useState(false);
  const [isAuthOverlayOpen, setIsAuthOverlayOpen] = React.useState(false);

  const authOverlayRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  handleOutsideClick(authOverlayRef, () => setIsAuthOverlayOpen(false));
  handleOutsideClick(overlayRef, () => setIsOverlayOpen(false));

  const { isAuthenticated } = useAuth();

  return (
    <>
      <div
        className="flex rounded-full bg-grey shadow-light-grey p-4 items-center cursor-pointer transition-all"
        onClick={() => {
          isAuthenticated
            ? setIsOverlayOpen(!isOverlayOpen)
            : setIsAuthOverlayOpen(!isAuthOverlayOpen);
        }}
      >
        <p className="font-medium text-sm xlmd:text-[16px]">&#10133; &nbsp; Create new list</p>
      </div>
      {isOverlayOpen && (
        <>
          <div
            className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black opacity-50"
            onClick={() => setIsOverlayOpen(false)}
          ></div>

          <div
            ref={overlayRef}
            className="absolute top-[30%] left-[30%] lg:left-[35%] z-[999] min-w-[500px] h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CreateListOverlay close={() => setIsOverlayOpen(false)} />
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
    </>
  );
};

export const OverlayButtons = (props: ButtonProps) => {
  return (
    <button
      type={props.type}
      style={{ backgroundColor: props.disabled ? '#b2b2b2' : props.color }}
      className="w-full rounded-full py-3 px-4 cursor-pointer mt-2 disabled:opacity-30 disabled:pointer-events-none"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <p
        style={{ color: props.textColor }}
        className={`${props.parent === 'header' ? 'text-sm' : ''} text-center`}
      >
        {props.buttonText}
      </p>
    </button>
  );
};
