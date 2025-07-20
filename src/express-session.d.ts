import 'express-session';
import 'express';

declare module 'express-session' {
  interface Session {
    userId: number;
  }
}

declare module 'express' {
  interface Request {
    session: Express.Session;
  }
}
