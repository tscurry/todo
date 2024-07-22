import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import connectSession from 'connect-pg-simple';

import pool from './src/database/db';
import todoRoute from './src/routes/todo';
import authenticationRoute from './src/routes/authentication';

dotenv.config();

const app = express();

const pgSession = connectSession(session);

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
    secret: `${process.env.REACT_SESSION_SECRET}`,
    cookie: {
      secure: process.env.REACT_NODE_ENV === 'production' ? true : false,
      maxAge: 5 * 60 * 1000,
      // maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use('/todos', todoRoute);
app.use('/auth', authenticationRoute);

export default app;