import { User } from './utils/types';

declare global {
  namespace Express {
    interface Request {
      user: User | undefined;
    }
  }
}

export {};
