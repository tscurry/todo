import request from 'supertest';
import app from '../../app';
import pool, { cronSchedule } from '../database/db';
import { UUID } from 'crypto';
import { Todos } from '../utils/types';

// before tests; stop task scheduler
beforeAll(() => {
  cronSchedule.stop();
});

const verifiedUser = {
  username: 'poison xyz',
  password: '123',
};

const validTodo = {
  title: 'testing todo',
  due_date: '2024-07-19 20:30:00',
};

const todoWithExistingList = {
  title: 'testing todo',
  due_date: '2024-07-19 20:30:00',
  list_name: 'shopping',
  // user_uid: 'e94d38cb-71f5-4321-a44f-886f75c41999',
};

const todoWithNewList = {
  title: 'testing todo',
  due_date: '2024-07-19 20:30:00',
  list_name: 'shopping list',
  // user_uid: 'e94d38cb-71f5-4321-a44f-886f75c41999',
};

const todoWithNewListInvalid = {
  title: 'testing todo',
  due_date: '2024-07-19 20:30:00',
  list_name: 'shopping list',
  user_uid: '',
};

const validTempTodo = {
  temp_uid: 'e94d38cb-71f5-4321-a44f-886f75c41999',
  title: 'testing todo',
  due_date: '2024-07-19 20:30:00',
};

const validUserTodo = {
  user_uid: 'e94d38cb-71f5-4321-a44f-886f75c41999',
  title: 'testing todo',
  due_date: '2024-07-19 20:30:00',
};

let cookie: string;
let userUid: UUID;

beforeAll(async () => {
  await request(app).post('/auth/signup').send(verifiedUser).expect(201);
  const res = await request(app).post('/auth/login').send(verifiedUser).expect(200);
  userUid = res.body.id;
  cookie = res.headers['set-cookie'][0];
});

afterAll(async () => {
  await pool.query('DELETE FROM todos WHERE title = $1;', [validTempTodo.title]);
  await pool.query('DELETE FROM todos WHERE title = $1;', [validUserTodo.title]);
  await pool.query('DELETE FROM todos WHERE title = $1;', ['Complete report']);
  await pool.query('DELETE FROM user_lists WHERE name = $1', [todoWithNewList.list_name]);
  await pool.query('DELETE FROM user_lists WHERE name = $1', [todoWithExistingList.list_name]);
  await pool.query('DELETE FROM user_lists WHERE name = $1', ['Work']);
  await pool.query('DELETE FROM users WHERE username = $1;', [verifiedUser.username]);

  await pool.end();
});

describe('GET /todos', () => {
  describe('given user is authenticated', () => {
    it('should get the sum of completed todos', async () => {
      const sum = await request(app).get('/todos/completed').set('Cookie', cookie).expect(200);
      expect(sum.body.sum).toHaveProperty('count');
    });

    it('should get the todos for the authenticated user with the user_uid', async () => {
      const todosRes = await request(app).get('/todos').set('Cookie', cookie).expect(200);
      expect(todosRes.body.todos).toEqual(expect.any(Array));
    });

    describe('given user isnt authenticated', () => {
      it('should get the todos for the user with the temp_uid', async () => {
        const todosRes = await request(app).get(`/todos?${validTempTodo.temp_uid}`).expect(200);

        expect(todosRes.body.todos).toEqual(expect.any(Array));
      });
    });
  });
});

describe('GET /todos with color from list', () => {
  it('should return todos with color property if associated with list', async () => {
    const listResponse = await request(app)
      .post('/lists')
      .send({ name: 'Work', testId: userUid })
      .expect(201);

    const list = listResponse.body;

    const todoResponse = await request(app)
      .post('/todos')
      .send({
        title: 'Complete report',
        due_date: '2024-07-19 20:30:00',
        list_name: list.list.name,
      })
      .set('Cookie', cookie)
      .expect(201);

    const todosResponse = await request(app).get('/todos').set('Cookie', cookie).expect(200);
    const todos = todosResponse.body.todos;
    const todoWithColor = todos.find((todo: Todos) => todo.todo_id === todoResponse.body.todo_id);

    expect(todoWithColor).toHaveProperty('color', list.list.color);
  });

  it('should not include the color property for todos without an associated list', async () => {
    const todoResponse = await request(app)
      .post('/todos')
      .send(validTodo)
      .set('Cookie', cookie)
      .expect(201);

    const todosResponse = await request(app).get('/todos').set('Cookie', cookie).expect(200);

    const todos = todosResponse.body.todos;
    const unlistedTodo = todos.find((todo: Todos) => todo.todo_id === todoResponse.body.todo_id);

    expect(unlistedTodo).toHaveProperty('color', null); // Check color is undefined or null as expected
  });
});

describe('POST /todos', () => {
  describe('given the user is not authenticated', () => {
    describe('given temp_uid is empty or invalid', () => {
      it('should return 400 or 500', async () => {
        await request(app).post('/todos').send({ temp_uid: '' }).expect(400);
        await request(app).post('/todos').send({ temp_uid: 'sfsafsa' }).expect(500);
      });
    });
    describe('given temp_uid is valid', () => {
      it("should post todo associated with the user's temp_uid", async () => {
        await request(app).post('/todos').send(validTempTodo).expect(201);
      });
    });

    describe('given the user_uid isnt valid', () => {
      it('should return unauthorized', async () => {
        await request(app).post('/todos/newList').send(todoWithNewListInvalid).expect(401);
      });
    });
  });

  describe('given the user is authenticated', () => {
    it("should post todos associated with the users' session user_uid", async () => {
      await request(app).post('/todos').send(validUserTodo).set('Cookie', cookie).expect(201);
    });

    it('should create todo and add to existing list ', async () => {
      // create the list
      await request(app).post('/lists').send({ name: 'shopping', testId: userUid }).expect(201);

      // post the todos
      await request(app)
        .post('/todos')
        .send(todoWithExistingList)
        .set('Cookie', cookie)
        .expect(201);
    });

    it('should create a new list and add the todo', async () => {
      await request(app)
        .post('/todos/newList')
        .send(todoWithNewList)
        .set('Cookie', cookie)
        .expect(201);
    });
  });
});

describe('PUT /todos', () => {
  describe('given data sent is empty or some values are null', () => {
    it('should return 400', async () => {
      const res = await request(app)
        .post('/todos')
        .send(validUserTodo)
        .set('Cookie', cookie)
        .expect(201);

      await request(app).put(`/todos/${res.body.todo_id}`).send({}).expect(400);
    });
  });

  describe('given data sent is correct', () => {
    it('should update todo with the given id', async () => {
      const res = await request(app)
        .post('/todos')
        .send(validUserTodo)
        .set('Cookie', cookie)
        .expect(201);

      await request(app).put(`/todos/${res.body.todo_id}`).send(validTodo).expect(200);
    });
  });
});

describe('DELETE /todos', () => {
  it('it should delete todo by the id', async () => {
    await request(app).delete('/todos/1').expect(204);
  });
});
