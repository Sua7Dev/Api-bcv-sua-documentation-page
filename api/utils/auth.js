import jwt from 'jsonwebtoken';

/**
 * Verifies the session JWT from the request headers or query params.
 * Returns the decoded user profile if valid.
 */
export function verifySession(req) {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

  if (!token) return null;

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    console.error('JWT Verification failed:', error.message);
    return null;
  }
}
