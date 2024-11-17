import express from 'express';
import { QueryResult } from 'pg';
import pool from '../database/db';
import { colorGenerator } from '../utils/colorGenerator';
import { Lists, Todos } from '../utils/types';

const router = express.Router();

let lists: QueryResult<Lists>;

router.get('/', async (req, res) => {
  const user_uid = req.session.user_uid;

  try {
    // get list names
    lists = await pool.query(
      'SELECT user_lists.list_id, user_lists.name, user_lists.color, COUNT(list_todos.todo_id) AS item_count FROM user_lists LEFT JOIN list_todos ON user_lists.list_id = list_todos.list_id WHERE user_lists.user_uid = $1 GROUP BY user_lists.list_id, user_lists.name;',
      [user_uid],
    );

    res.status(200).json({ lists: lists.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error retrieving users' lists" });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const user_uid = req.session.user_uid;

  let todos: QueryResult<Todos>;

  try {
    if (typeof user_uid === 'undefined') return res.status(404).send('invalid user_uid');

    todos = await pool.query(
      'SELECT todos.*, user_lists.color FROM todos JOIN list_todos ON todos.todo_id = list_todos.todo_id JOIN user_lists ON list_todos.list_id = user_lists.list_id WHERE list_todos.list_id = $1 AND todos.user_uid = $2 ORDER BY todos.due_date;',
      [Number(id), user_uid],
    );

    res.status(200).json({ todos: todos.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error retrieving todos for list' });
  }
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  const user_uid = req.session.user_uid;
  let color = colorGenerator();

  let list: QueryResult<Lists>;

  // change to use user_uid not test id
  try {
    if (typeof user_uid !== 'undefined') {
      // check for color conflicts
      let colorExists = true;

      while (colorExists) {
        const existingColor = await pool.query('SELECT * FROM user_lists WHERE color = $1', [
          color,
        ]);

        if (existingColor.rows.length === 0) colorExists = false;
        else color = colorGenerator();
      }

      list = await pool.query(
        'INSERT INTO user_lists (user_uid, name, color) VALUES($1, $2, $3) RETURNING list_id;',
        [user_uid, name, color],
      );
    } else {
      return res.status(401).json({ error: 'unauthorized' });
    }
    res.status(201).json({ listId: list.rows[0].list_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `error creating ${name} list` });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const user_uid = req.session.user_uid;

  try {
    if (name) {
      await pool.query('UPDATE user_lists SET name = $1 WHERE list_id = $2 AND user_uid = $3;', [
        name,
        Number(id),
        user_uid,
      ]);
    }
    res.status(200).json(`${name} list successfully updated`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `unable to update ${name} list` });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM user_lists WHERE list_id = $1', [Number(id)]);

    return res.status(204).json('successful list deletion');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `unable to delete list` });
  }
});

export default router;
