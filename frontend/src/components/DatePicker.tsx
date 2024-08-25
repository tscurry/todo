/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateDropdown = () => {
  const [date, setDate] = React.useState<Date | null>(new Date());

  const ButtonInput = React.forwardRef((props: any, ref) => {
    return (
      <button {...props} ref={ref} className="date-picker">
        {props.value}
      </button>
    );
  });

  return (
    <div className="date-picker-container">
      <DatePicker
        selected={date}
        onChange={(selectedDate) => setDate(selectedDate)}
        timeInputLabel="Time:"
        showTimeInput
        dateFormat="dd MMMM yyyy h:mm aa"
        customInput={<ButtonInput />}
      />
    </div>
  );
};

export default DateDropdown;
