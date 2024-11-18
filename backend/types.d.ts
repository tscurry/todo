import 'express-session';

declare module 'express-session' {
  interface Session {
    user_uid: string;
  }
}
