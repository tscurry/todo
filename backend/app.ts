import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import listsRoute from './src/routes/lists';
import todoRoute from './src/routes/todo';
import authenticationRoute from './src/routes/authentication';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
  }),
);

app.use(express.json());

app.use('/todos', todoRoute);
app.use('/lists', listsRoute);
app.use('/auth', authenticationRoute);

export default app;
