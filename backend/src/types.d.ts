import { UUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      user:
        | {
            user_uid: UUID;
            username: string;
          }
        | undefined;
    }
  }
}

export {};
