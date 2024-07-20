CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  user_uid UUID PRIMARY KEY,
  username VARCHAR(30) UNIQUE,
  hashed_password VARCHAR(255)
);

CREATE TABLE todos (
  todo_id SERIAL PRIMARY KEY,
  temp_uid UUID,
  user_uid UUID,
  title VARCHAR(30) NOT NULL,
  priority TEXT NOT NULL,
  due_date TIMESTAMP NOT NULL,
  FOREIGN KEY (user_uid) REFERENCES users(user_uid)
);
