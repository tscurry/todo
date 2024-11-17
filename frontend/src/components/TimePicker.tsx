import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimeClock } from '@mui/x-date-pickers/TimeClock';
import { DateTimeProps } from '../utils/types';
import dayjs from 'dayjs';

const TimePicker = (props: DateTimeProps) => {
  const [minTime, setMinTime] = React.useState(dayjs());

  React.useEffect(() => {
    const today = dayjs(new Date());
    const currentTime = dayjs();

    if (props.selectedDate && props.selectedDate.isSame(today, 'day')) {
      setMinTime(currentTime);
    } else {
      setMinTime(dayjs().startOf('day'));
    }
  }, [props.selectedDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimeClock
        ampmInClock
        value={props.selectedTime}
        onChange={(newTime) => props.handleChange(newTime, 'time')}
        showViewSwitcher
        minTime={minTime}
      />
    </LocalizationProvider>
  );
};

export default TimePicker;
