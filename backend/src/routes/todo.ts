import express from 'express';
import { QueryResult } from 'pg';
import pool from '../database/db';

const router = express.Router();

type Todos = {
  // rows: {
  todos: {
    todo_uid: number;
    temp_uid: string;
    user_uid: string;
    title: string;
    due_date: string;
    priority: string;
  }[];
  // };
}[];

router.get('/', async (req, res) => {
  const { temp_uid } = req.query;
  const user_uid = req.session.user_uid;

  let todos: QueryResult<Todos>;

  try {
    if (typeof user_uid !== 'undefined') {
      todos = await pool.query('SELECT * FROM todos WHERE user_uid = $1;', [user_uid]);
    } else {
      todos = await pool.query('SELECT * FROM todos WHERE temp_uid = $1;', [temp_uid]);
    }

    res.status(200).json({ todos: todos.rows, sess: req.session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error retrieving todos' });
  }
});

router.post('/', async (req, res) => {
  const { title, priority, due_date, temp_uid } = req.body;
  const user_uid = req.session.user_uid;

  try {
    if (typeof user_uid !== 'undefined') {
      await pool.query(
        'INSERT INTO todos (user_uid, title, priority, due_date) VALUES($1, $2, $3, $4);',
        [user_uid, title, priority, due_date],
      );
    } else {
      await pool.query(
        'INSERT INTO todos (temp_uid, title, priority, due_date) VALUES($1, $2, $3, $4);',
        [temp_uid, title, priority, due_date],
      );
    }
    res.status(201).json('successfully added todo');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error adding todo to database' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, priority, due_date } = req.body;

  try {
    await pool.query(
      'UPDATE todos SET title = $1, priority = $2, due_date = $3 WHERE todo_id = $4;',
      [title, priority, due_date, id],
    );
    res.status(200).json('successfully updated todo');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating todo' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM todos WHERE todo_id = $1;', [id]);
    res.status(200).json('Item succesfully deleted');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting todo' });
  }
});

export default router;
