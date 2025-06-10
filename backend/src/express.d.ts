declare global {
  namespace Express {
    interface Request {
      user?: {
        user_uid: string;
        username: string;
      };
    }
  }
}

export {};
