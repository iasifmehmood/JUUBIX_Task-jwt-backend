import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import AuthenticatedRequest from '../interfaces/AuthenticateRequest';

// Define the interface for the decoded token
interface DecodedToken {
  userId: number;
  username: string;
  email: string;
}

// Middleware function to verify JWT
export const verifyJwtMiddleware = (
  req: AuthenticatedRequest,
  res: Response<any, Record<string, any>>,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(' ')[1]; // Get the token from the Authorization header

  if (!token) {
    res.status(401).json({ error: 'No token provided.' });
    return;
  }

  const secretKey: Secret = process.env.SECRETKEY as Secret;

  if (!secretKey) {
    res
      .status(500)
      .json({ error: 'JWT secret key not found in environment variables.' });
    return;
  }

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, secretKey) as DecodedToken;
    console.log(decodedToken);
    req.userId = decodedToken.userId; // Attach the userId to the request object for future use
    req.username = decodedToken.username;
    req.email = decodedToken.email;
    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};
