import app from './app';

app.listen(process.env.REACT_PORT, () =>
  console.log(`listening on port ${process.env.REACT_PORT}!`),
);
