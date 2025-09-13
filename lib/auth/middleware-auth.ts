import { decodeJwt, JWTPayload } from 'jose';

export interface CustomJWTPayload {
  sub: string;
  role: string;
  exp: number;
  jti: string;
}

export function verifyAccessToken(token: string): CustomJWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production';
    const payload = decodeJwt(token);

    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }

    return {
      sub: payload.sub || '',
      role: (payload as any).role || 'CANDIDATE',
      exp: payload.exp || 0,
      jti: (payload as any).jti || ''
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}