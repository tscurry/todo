const express = require('express');
require('dotenv').config();
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const todoRoute = require('./routes/todo');
const authenticationRoute = require('./routes/authentication');
const pool = require('./db/db');

const app = express();

app.use(
  cors({
    origin: process.env.REACT_CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.use(
  session({
    name: 'user_session',
    store: new pgSession({
      pool: pool,
      tableName: 'sessions',
      createTableIfMissing: true,
    }),
    saveUninitialized: false,
    resave: false,
    secret: process.env.REACT_SESSION_SECRET,
    cookie: {
      secure: process.env.REACT_NODE_ENV === 'production' ? true : false,
      maxAge: 5 * 60 * 1000,
      // maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use('/todos', todoRoute);
app.use('/auth', authenticationRoute);

app.listen(process.env.REACT_PORT, () =>
  console.log(`Example app listening on port ${process.env.REACT_PORT}!`),
);
