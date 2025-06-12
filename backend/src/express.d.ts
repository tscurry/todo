import { User } from './utils/types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
