import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devsupersecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayloadCustom {
  sub: string | number;
  role: 'buyer' | 'seller' | 'admin';
}

export function signToken(payload: JwtPayloadCustom): string {
  // @ts-ignore
  return jwt.sign(
    { ...payload }, 
    JWT_SECRET as string, 
    { expiresIn: JWT_EXPIRES_IN } 
  );
}

export function verifyToken<T extends object = any>(token: string): T & JwtPayloadCustom {
  return jwt.verify(token, JWT_SECRET) as any;
}
