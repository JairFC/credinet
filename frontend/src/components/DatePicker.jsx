import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DatePicker = ({ selected, onChange }) => {
  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      dateFormat="yyyy-MM-dd"
      className="form-control"
      wrapperClassName="date-picker-wrapper"
    />
  );
};

export default DatePicker;