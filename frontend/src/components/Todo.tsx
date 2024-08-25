import * as React from 'react';

const Todo = () => {
  return (
    <>
      <div className="todo-container">
        <div className="checkbox-complete"></div>
        <div className="container">
          <p className="todo">Put away dishes</p>
          <p className="time">11:56 PM</p>
        </div>
      </div>
    </>
  );
};

export default Todo;
