import { JwtPayload } from './types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
