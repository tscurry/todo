import * as React from 'react';
import { loginUser } from './api/auth';

const App = () => {
  React.useEffect(() => {
    const x = async () => {
      await loginUser({ username: 'poison crapo', password: 'NahNigga1!' });
    };
    void x();
  }, []);
  return (
    <>
      <p></p>
    </>
  );
};

export default App;
