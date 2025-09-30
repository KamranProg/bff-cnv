import type { Request } from 'express';
import { COOKIE_SECURE, COOKIE_SAMESITE, CSRF_COOKIE, CSRF_HEADER } from './config';
import type { Response } from 'express';

export function issueCsrfCookie(res: Response) {
  const token = cryptoRandom();
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAMESITE,
    maxAge: 8 * 60 * 60 * 1000,
    path: '/',
  });
}

export function requireCsrf(req: Request) {
  const cookie = req.cookies?.[CSRF_COOKIE];
  const header = req.header(CSRF_HEADER);
  if (!cookie || !header || cookie !== header) {
    const e = new Error('CSRF');
    (e as any).status = 403;
    throw e;
  }
}

function cryptoRandom() {
  // small helper w/o Node 20+ webcrypto assumptions
  return [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}
