import * as React from 'react';

export const handleOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  onClickOutside: () => void,
) => {
  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [ref, onClickOutside]);
};
