import request from 'supertest';
import app from '../../app';
import pool, { cronSchedule } from '../database/db';

const verifiedUser = {
  username: 'poison abc',
  password: '123',
};

const newUser = {
  username: 'po',
  password: '123',
};

let cookie: string;

beforeAll(async () => {
  cronSchedule.stop();

  await request(app).post('/auth/signup').send(verifiedUser).expect(201);
  const res = await request(app).post('/auth/login').send(verifiedUser).expect(200);

  cookie = res.headers['set-cookie'][0];
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE username = $1;', [verifiedUser.username]);
  await pool.end();
});

describe('GET /auth', () => {
  describe('gets the current users username', () => {
    it('should return the users username', async () => {
      const res = await request(app).get('/auth/user').set('Cookie', cookie).expect(200);
      expect(res.body.username).toBeDefined();
    });
  });

  describe('gets authentication status', () => {
    it('should return false when the user isnt authenticated', async () => {
      const res = await request(app).get('/auth/status');

      expect(res.body.isAuthenticated).toEqual(false);
    });

    it('should return true when the user is authenticated', async () => {
      const status = await request(app).get('/auth/status').set('Cookie', cookie);
      expect(status.body.isAuthenticated).toEqual(true);
    });
  });
});

describe('POST /auth', () => {
  describe('signs up', () => {
    describe('given the user already exists', () => {
      it('should return 409 with message', async () => {
        const res = await request(app).post('/auth/signup').send(verifiedUser).expect(409);
        expect(res.body.error).toEqual('user already exists');
      });
    });

    describe('given body is empty', () => {
      it('should return 500', async () => {
        const res = await request(app).post('/auth/signup').send().expect(500);
        expect(res.body).toEqual({ error: 'error signing up' });
      });
    });

    describe('given the user does not exist', () => {
      it('signs up user and save the user to the database', async () => {
        const res = await request(app).post('/auth/signup').send(newUser).expect(201);

        const result = await pool.query('SELECT * FROM users WHERE username = $1', [
          newUser.username,
        ]);

        expect(res.body.accountCreated).toEqual(true);
        expect(result.rows.length).toBe(1);
      });

      afterAll(async () => {
        await pool.query('DELETE FROM users WHERE username = $1;', [newUser.username]);
      });
    });
  });

  describe('logs in', () => {
    describe('given the user does not exist', () => {
      it('should return status code 401 with message', async () => {
        const res = await request(app).post('/auth/login').send(newUser).expect(401);

        expect(res.body.userError).toEqual('user does not exist.');
      });
    });

    describe('given user exists but password is incorrect', () => {
      it('should return status code 401 with message', async () => {
        const res = await request(app)
          .post('/auth/login')
          .send({ username: 'poison abc', password: 'yes' })
          .expect(401);

        expect(res.body.passwordError).toEqual('incorrect password');
      });
    });

    describe('given the user credentials are correct', () => {
      it('should return 200 with message and username', async () => {
        const res = await request(app).post('/auth/login').send(verifiedUser).expect(200);

        cookie = res.headers['set-cookie'][0];

        expect(res.body.username).toEqual(verifiedUser.username);
      });

      it("should create a new user_session with the users' user_uid", async () => {
        const sess = await request(app).get('/auth/session').set('Cookie', cookie).expect(201);
        expect(sess.body).toHaveProperty('user_uid');
      });
    });
  });

  describe('user logs out', () => {
    it("should destroy the users' session", async () => {
      await request(app).post('/auth/logout').set('Cookie', cookie).expect(200);

      const sessResponse = await request(app)
        .get('/auth/session')
        .set('Cookie', cookie)
        .expect(401);
      expect(sessResponse.body).toEqual({ error: 'unauthorized' });
    });
  });
});
