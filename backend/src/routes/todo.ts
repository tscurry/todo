import express from 'express';
import pool from '../database/db';
import { QueryResult } from 'pg';
import { Todos } from '../utils/types';

const router = express.Router();

router.get('/total', async (req, res) => {
  const { temp_uid } = req.query;
  const user_uid = req.session.user_uid;

  let count;

  try {
    if (temp_uid === '' && typeof user_uid === 'undefined')
      return res.status(400).send('temp_uid is required for unauthenticated users');

    if (typeof user_uid !== 'undefined') {
      count = await pool.query('SELECT COUNT(*) FROM todos WHERE user_uid = $1', [user_uid]);
    } else {
      count = await pool.query('SELECT COUNT(*) FROM todos WHERE temp_uid = $1', [temp_uid]);
    }

    res.status(200).json(count.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error getting total count' });
  }
});

router.get('/', async (req, res) => {
  const { temp_uid } = req.query;
  const user_uid = req.session.user_uid;

  let todos: QueryResult<Todos>;

  try {
    if (temp_uid === '' && typeof user_uid === 'undefined')
      return res.status(400).send('temp_uid is required for unauthenticated users');

    if (typeof user_uid !== 'undefined') {
      todos = await pool.query(
        'SELECT todos.*, user_lists.color FROM todos LEFT JOIN list_todos ON list_todos.todo_id = todos.todo_id LEFT JOIN user_lists ON user_lists.list_id = list_todos.list_id WHERE todos.user_uid = $1 AND todos.is_completed = $2 ORDER BY due_date;',
        [user_uid, false],
      );
    } else {
      todos = await pool.query(
        'SELECT * FROM todos WHERE temp_uid = $1 AND is_completed = $2 ORDER BY due_date;',
        [temp_uid, false],
      );
    }
    res.status(200).json({ todos: todos.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error retrieving todos' });
  }
});

router.get('/completed', async (req, res) => {
  const { temp_uid } = req.query;
  const user_uid = req.session.user_uid;

  let count;
  let completed;

  try {
    if (temp_uid === '' && typeof user_uid === 'undefined')
      return res.status(400).send('temp_uid is required for unauthenticated users');

    if (typeof user_uid !== 'undefined') {
      count = await pool.query(
        'SELECT COUNT(is_completed) FROM todos WHERE is_completed = $1 AND user_uid = $2;',
        [true, user_uid],
      );

      completed = await pool.query(
        'SELECT * FROM todos WHERE is_completed = $1 AND user_uid = $2;',
        [true, user_uid],
      );
    } else {
      count = await pool.query(
        'SELECT COUNT(is_completed) FROM todos WHERE is_completed = $1 AND temp_uid = $2;',
        [true, temp_uid],
      );

      completed = await pool.query(
        'SELECT * FROM todos WHERE is_completed = $1 AND temp_uid = $2;',
        [true, temp_uid],
      );
    }

    res.status(200).send({ sum: count.rows[0], completedTodos: completed.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'something went wrong' });
  }
});

router.post('/', async (req, res) => {
  const { title, due_date, temp_uid, list_name } = req.body;
  const user_uid = req.session.user_uid;

  let todos: QueryResult<Todos>;

  try {
    if (temp_uid === '' && typeof user_uid === 'undefined')
      return res.status(400).json('temp_uid is required for unauthenticated users');

    if (typeof user_uid !== 'undefined') {
      todos = await pool.query(
        'INSERT INTO todos (user_uid, title, due_date) VALUES($1, $2, $3) RETURNING todo_id;',
        [user_uid, title, due_date],
      );

      let listId;

      if (list_name) {
        const list = await pool.query('SELECT list_id from user_lists WHERE name = $1;', [
          list_name,
        ]);

        listId = list.rows[0].list_id;
      }

      // if user selects a list, insert that todo into the list
      if (typeof listId === 'number') {
        await pool.query('INSERT INTO list_todos (list_id, todo_id) VALUES ($1, $2);', [
          listId,
          todos.rows[0].todo_id,
        ]);
      }
    } else {
      todos = await pool.query(
        'INSERT INTO todos (temp_uid, title, due_date) VALUES($1, $2, $3) RETURNING todo_id;',
        [temp_uid, title, due_date],
      );
    }

    res.status(201).json({ message: 'successfully added todo', todo_id: todos.rows[0].todo_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error adding todo to database' });
  }
});

router.put('/:todo_id', async (req, res) => {
  const { todo_id } = req.params;
  const { title, due_date, list_name } = req.body;
  const user_uid = req.session.user_uid;

  let list_id;

  try {
    if (!title || !due_date) {
      return res.status(400).json('something has to be updated');
    }

    if (list_name) {
      const list = await pool.query(
        'SELECT list_id FROM user_lists WHERE name = $1 AND user_uid = $2',
        [list_name, user_uid],
      );

      list_id = list.rows[0].list_id;
    }

    const updatedTodo = await pool.query(
      'UPDATE todos SET title = $1, due_date = $2 WHERE todo_id = $3 RETURNING *;',
      [title, due_date, Number(todo_id)],
    );

    if (updatedTodo.rows.length === 0) {
      return res.status(404).json('todo does not exist');
    }

    // add todo to list
    if (list_id) {
      const existingAssociation = await pool.query('SELECT * FROM list_todos WHERE todo_id = $1;', [
        todo_id,
      ]);

      if (existingAssociation.rows.length > 0) {
        await pool.query('UPDATE list_todos SET list_id = $1 WHERE todo_id = $2;', [
          list_id,
          todo_id,
        ]);
      } else {
        await pool.query('INSERT INTO list_todos (list_id, todo_id) VALUES ($1, $2);', [
          list_id,
          todo_id,
        ]);
      }
    }

    res.status(200).json(updatedTodo.rows);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: 'Error updating todo' });
  }
});

router.put('/:id/completed', async (req, res) => {
  const { id } = req.params;
  const { is_completed } = req.body;

  try {
    const response = await pool.query('UPDATE todos SET is_completed = $1 WHERE todo_id = $2;', [
      is_completed,
      Number(id),
    ]);

    if (response) {
      await pool.query('DELETE FROM list_todos WHERE todo_id = $1', [id]);
    }

    res
      .status(200)
      .json({ message: `todo ${id} marked as ${is_completed ? 'completed' : 'not completed'}.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating todo' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM todos WHERE todo_id = $1;', [Number(id)]);
    res.status(204).json('successful todo deletion');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting todo' });
  }
});

export default router;
