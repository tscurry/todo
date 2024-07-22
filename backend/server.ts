import app from './app';

app.listen(process.env.REACT_PORT, () =>
  console.log(`Example app listening on port ${process.env.REACT_PORT}!`),
);
