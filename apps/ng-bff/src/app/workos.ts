import { WorkOS } from '@workos-inc/node';
import {
  WORKOS_API_KEY,
  WORKOS_CLIENT_ID,
  WORKOS_COOKIE_PASSWORD,
} from './config';
import type { Request } from 'express';

export type { User as WorkOSUser } from '@workos-inc/node';

export const workos = new WorkOS(WORKOS_API_KEY, {
  clientId: WORKOS_CLIENT_ID,
});

/**
 * Load & validate the current WorkOS AuthKit sealed session from the request.
 *
 * Reads the `wos-session` cookie and asks the WorkOS SDK to decrypt/verify it
 * using `WORKOS_COOKIE_PASSWORD`. Use this in routes that require an authenticated
 * user before issuing app-specific tokens.
 *
 * Behavior:
 * - If the cookie is absent, this may return `null | undefined` (SDK-dependent).
 * - If the cookie is present but invalid/mismatched, the SDK may throw.
 *
 * Example:
 * ```ts
 * try {
 *   const session = loadSealedSession(req); // note: no `await` (sync return)
 *   if (!session) return res.status(401).end();
 *   // session.user, session.organization, etc.
 * } catch {
 *   return res.status(401).end();
 * }
 * ```
 *
 * @param req Express Request (expects `req.cookies['wos-session']`).
 * @returns Whatever the SDK returns (session object or null/undefined).
 */
type LoadedSession = ReturnType<typeof workos.userManagement.loadSealedSession>;

export function loadSealedSession(req: Request): LoadedSession {
  const sessionData = req.cookies?.['wos-session'] as string | undefined;
  return workos.userManagement.loadSealedSession({
    sessionData,
    cookiePassword: WORKOS_COOKIE_PASSWORD,
  });
}
