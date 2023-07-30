import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  userId?: number;
  username?: string;
  email?: string;
}

export default AuthenticatedRequest;
