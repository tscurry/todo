import request from 'supertest';
import app from '../../app';
import pool, { cronSchedule } from '../database/db';
import { UUID } from 'crypto';

beforeAll(() => {
  cronSchedule.stop();
});

const verifiedUser = {
  username: 'poison',
  password: '123',
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
  await pool.query('DELETE FROM user_lists WHERE name = $1', ['shopping']);
  await pool.query('DELETE FROM user_lists WHERE name = $1', ['shopping list']);
  await pool.query('DELETE FROM users WHERE username = $1;', [verifiedUser.username]);
  pool.end();
});

describe('/GET lists', () => {
  describe('gets lists and number of todos for each list', () => {
    it('returns lists and the sum of todos associated with list', async () => {
      const lists = await request(app).get('/lists').set('Cookie', cookie).expect(200);

      expect(lists.body.lists).toEqual(expect.any(Array));
    });
  });

  describe('gets lists by id', () => {
    it('returns list and todos associated with that list', async () => {
      const res = await request(app)
        .post('/lists')
        .send({ name: 'shopping', testId: userUid })
        .expect(201);

      const list = await request(app)
        .get(`/lists/${res.body.listId}`)
        .set('Cookie', cookie)
        .expect(200);

      expect(list.body.todos).toEqual(expect.any(Array));
    });
  });
});

describe('/POST lists', () => {
  describe('creates a new list for user', () => {
    it('should create a new list for the user then return the list_id', async () => {
      const res = await request(app)
        .post('/lists')
        .send({ name: 'shopping', testId: userUid })
        .expect(201);

      expect(res.body.listId).toEqual(expect.any(Number));
    });
  });
});

describe('/PUT lists', () => {
  describe('updates list selected by user', () => {
    it('should update the list and return a success message', async () => {
      const res = await request(app)
        .post('/lists')
        .send({ name: 'shopping', testId: userUid })
        .expect(201);

      await request(app)
        .put(`/lists/${res.body.listId}`)
        .send({ name: 'shopping list', testId: userUid })
        .expect(200);
    });
  });
});

describe('/DELETE lists', () => {
  it('should delete the selected list', async () => {
    const res = await request(app)
      .post('/lists')
      .send({ name: 'shopping', testId: userUid })
      .expect(201);

    await request(app).delete(`/lists/${res.body.listId}`).expect(204);
  });
});
