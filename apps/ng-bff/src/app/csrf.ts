import type { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import {
  COOKIE_SECURE,
  COOKIE_SAMESITE,
  CSRF_COOKIE,
  CSRF_HEADER,
} from './config';

/**
 * Lightweight HTTP error that carries a status code.
 * Used to signal CSRF failures with a 4xx response.
 */
export class HttpError extends Error {
  constructor(public status: number, message = 'Error') {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * Set a CSRF cookie the client will echo back in a header on mutating requests.
 * - Cookie is NOT httpOnly because the header must be set from the browser.
 * - Token lifetime: 8 hours.
 */
export function issueCsrfCookie(res: Response): void {
  const token = cryptoRandom();
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAMESITE,
    maxAge: 8 * 60 * 60 * 1000, // 8h
    path: '/',
  });
}

/**
 * Verify CSRF protection by comparing cookie and header values.
 * Throws HttpError(403) if missing or mismatched.
 */
export function requireCsrf(req: Request): void {
  const cookie = req.cookies?.[CSRF_COOKIE];
  const header = req.header(CSRF_HEADER);
  if (!cookie || !header || cookie !== header) {
    throw new HttpError(403, 'CSRF');
  }
}

/**
 * Generate a cryptographically-strong random hex token (32 chars).
 */
function cryptoRandom(): string {
  return randomBytes(16).toString('hex');
}
