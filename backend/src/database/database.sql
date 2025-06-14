CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  user_uid UUID PRIMARY KEY,
  username VARCHAR(30) UNIQUE,
  hashed_password VARCHAR(255)
);

CREATE TABLE refresh_tokens (
  user_uid UUID PRIMARY KEY REFERENCES users(user_uid) ON DELETE CASCADE,
  token VARCHAR(512) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

CREATE TABLE user_lists (
  list_id SERIAL PRIMARY KEY,
  user_uid UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  FOREIGN KEY (user_uid) REFERENCES users(user_uid)
);

CREATE TABLE todos (
  todo_id SERIAL PRIMARY KEY,
  temp_uid UUID,
  user_uid UUID,
  title VARCHAR(50) NOT NULL,
  due_date TIMESTAMP NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_uid) REFERENCES users(user_uid)
);

CREATE TABLE list_todos (
  list_id INTEGER REFERENCES user_lists(list_id) ON DELETE CASCADE,
  todo_id INTEGER REFERENCES todos(todo_id) ON DELETE CASCADE,
  PRIMARY KEY (list_id, todo_id)
);
