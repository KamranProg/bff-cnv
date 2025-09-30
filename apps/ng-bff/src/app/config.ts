import { readFileSync } from 'fs';
import { resolve } from 'path';

export const APP_URL = process.env.APP_URL ?? 'http://localhost:4200';
export const BFF_URL = process.env.BFF_URL ?? 'http://localhost:3000';

export const COOKIE_SECURE = process.env.NODE_ENV === 'production';
export const COOKIE_SAMESITE = (process.env.COOKIE_SAMESITE as 'lax'|'strict'|'none') ?? 'lax';
export const CSRF_COOKIE = 'XSRF-TOKEN';
export const CSRF_HEADER = 'X-XSRF-TOKEN';

// Convex JWT
export const JWT_EXPIRES_SECS = Number(process.env.JWT_EXPIRES_SECS ?? 90);
export const JWT_ISSUER = BFF_URL;

const keyPath = process.env.JWT_PRIVATE_KEY_FILE
  ? resolve(process.cwd(), process.env.JWT_PRIVATE_KEY_FILE)
  : null;
export const JWT_PRIVATE_KEY_PEM =
  (keyPath ? readFileSync(keyPath, 'utf8') : process.env.JWT_PRIVATE_KEY_PEM)?.trim() ??
  (() => { throw new Error('Missing JWT private key'); })();

// WorkOS
export const WORKOS_API_KEY = process.env.WORKOS_API_KEY ?? '';
export const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID ?? '';
export const WORKOS_COOKIE_PASSWORD = process.env.WORKOS_COOKIE_PASSWORD ?? '';
