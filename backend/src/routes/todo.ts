import express from 'express';
import { QueryResult } from 'pg';
import pool from '../database/db';

const router = express.Router();

type Todos = {
  todo_id: number;
  temp_uid: string;
  user_uid: string;
  title: string;
  due_date: string;
  is_completed: boolean;
};

router.get('/', async (req, res) => {
  const { temp_uid } = req.query;
  const user_uid = req.session.user_uid;

  let todos: QueryResult<Todos>;

  try {
    if (temp_uid === '')
      return res.status(400).send('temp_uid is required for unauthenticated users');

    if (typeof user_uid !== 'undefined') {
      todos = await pool.query('SELECT * FROM todos WHERE user_uid = $1;', [user_uid]);
    } else {
      todos = await pool.query('SELECT * FROM todos WHERE temp_uid = $1;', [temp_uid]);
    }

    res.status(200).json({ todos: todos.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error retrieving todos' });
  }
});

router.get('/completed', async (req, res) => {
  const { is_completed } = req.body;
  try {
    const count = await pool.query(
      'SELECT COUNT(is_completed) FROM todos WHERE is_completed = $1;',
      [is_completed],
    );
    res.status(200).send({ sum: count.rows });
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
    if (temp_uid === '')
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
    // console.error(error);
    res.status(500).json({ error: 'Error adding todo to database' });
  }
});

router.post('/newList', async (req, res) => {
  const { title, due_date, list_name } = req.body;
  const user_uid = req.session.user_uid;

  try {
    // create list first
    if (typeof user_uid !== 'undefined') {
      const list = await pool.query(
        'INSERT INTO user_lists (user_uid, name) VALUES($1, $2) RETURNING list_id;',
        [user_uid, list_name],
      );

      const listId = list.rows[0].list_id;

      // create the todo
      const todo = await pool.query(
        'INSERT INTO todos (user_uid, title, due_date) VALUES($1, $2, $3) RETURNING todo_id;',
        [user_uid, title, due_date],
      );

      const todoId = todo.rows[0].todo_id;

      // add the todo to that list
      await pool.query('INSERT INTO list_todos (list_id, todo_id) VALUES($1, $2);', [
        listId,
        todoId,
      ]);
    } else return res.status(401).send('must have a valid user uid to create a list');
    res.status(201).json('todo and new list successfully created');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed to add todo with new list.' });
  }
});

router.put('/:todo_id', async (req, res) => {
  const { todo_id } = req.params;
  const { title, due_date, list_id, list_name } = req.body;
  const user_uid = req.session.user_uid;

  try {
    let listId = list_id;

    if (!title || !due_date) {
      return res.status(400).json('something has to be updated');
    }

    // updating todo and adding to a new list
    if (list_name) {
      const list = await pool.query(
        'INSERT INTO user_lists (user_uid, name) VALUES($1, $2) RETURNING list_id;',
        [user_uid, list_name],
      );

      listId = list;
    }

    const updatedTodo = await pool.query(
      'UPDATE todos SET title = $1, due_date = $2 WHERE todo_id = $3 RETURNING *;',
      [title, due_date, Number(todo_id)],
    );

    if (updatedTodo.rows.length === 0) {
      return res.status(404).json('todo does not exist');
    }

    // add todo to list
    if (listId) {
      await pool.query('INSERT INTO list_todos (list_id, todo_id) VALUES($1, $2);', [
        listId,
        todo_id,
      ]);
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
    await pool.query('UPDATE todos SET is_completed = $1 WHERE todo_id = $2;', [
      is_completed,
      Number(id),
    ]);
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
