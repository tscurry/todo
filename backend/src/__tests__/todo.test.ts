import request from 'supertest';
import app from '../../app';
import pool, { cronSchedule } from '../database/db';

// before tests; stop task scheduler
beforeAll(() => {
  cronSchedule.stop();
});

afterAll(async () => {
  await pool.end();
});

const verifiedUser = {
  username: 'poison crapo',
  password: 'test123',
};

const validTodo = {
  title: 'testing todo',
  priority: 'medium',
  due_date: '2024-07-19 20:30:00',
};

const validTempTodo = {
  temp_uid: 'e94d38cb-71f5-4321-a44f-886f75c41999',
  title: 'testing todo',
  priority: 'medium',
  due_date: '2024-07-19 20:30:00',
};

const validUserTodo = {
  user_uid: 'e94d38cb-71f5-4321-a44f-886f75c41999',
  title: 'testing todo',
  priority: 'medium',
  due_date: '2024-07-19 20:30:00',
};

describe('GET /todos', () => {
  let cookie: string;
  beforeAll(async () => {
    const res = await request(app).post('/auth/login').send(verifiedUser).expect(200);
    cookie = res.headers['set-cookie'][0];
  });

  describe('given user is authenticated', () => {
    it('should get the todos for the authenticated user with the user_uid', async () => {
      const todosRes = await request(app).get('/todos').set('Cookie', cookie).expect(200);

      expect(todosRes.body.todos).toEqual(expect.any(Array));
    });
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
  });

  describe('given the user is authenticated', () => {
    let cookie: string;
    beforeAll(async () => {
      const res = await request(app).post('/auth/login').send(verifiedUser).expect(200);
      cookie = res.headers['set-cookie'][0];
    });
    it("should post todos associated with the users' session user_uid", async () => {
      await request(app).post('/todos').send(validUserTodo).set('Cookie', cookie).expect(201);
    });
  });

  afterAll(async () => {
    await pool.query('DELETE FROM todos WHERE title = $1', [validUserTodo.title]);
  });
});

describe('PUT /todos', () => {
  describe('given data sent is empty or some values are null', () => {
    it('should return 400', async () => {
      await request(app).put('/todos/2').send({}).expect(400);
    });
  });

  describe('given data sent is correct', () => {
    it('should update todo with the given id', async () => {
      await request(app).put('/todos/2').send(validTodo).expect(200);
    });
  });
});

describe('DELETE /todos', () => {
  it('it should delete todo by the id', async () => {
    await request(app).delete('/todos/6').expect(200);
  });
});
