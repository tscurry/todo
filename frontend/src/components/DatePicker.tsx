import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimeProps } from '../utils/types';
import dayjs from 'dayjs';
import 'react-calendar/dist/Calendar.css';

const DatePickerCalendar = (props: DateTimeProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div
        className="my-1 py-4 hover:bg-grey w-[90%] mx-auto rounded-lg"
        onClick={() => props.handleChange(null, 'date')}
      >
        <p className="text-center text-sm">No date</p>
      </div>
      <DateCalendar
        value={props.selectedDate}
        onChange={(newDate) => props.handleChange(newDate, 'date')}
        views={['day']}
        minDate={dayjs(new Date())}
      />
    </LocalizationProvider>
  );
};

export default DatePickerCalendar;
