import { WorkOS } from '@workos-inc/node';
import { WORKOS_API_KEY, WORKOS_CLIENT_ID, WORKOS_COOKIE_PASSWORD } from './config';
import type { Request } from 'express';

export type { User as WorkOSUser } from '@workos-inc/node';

export const workos = new WorkOS(WORKOS_API_KEY, { clientId: WORKOS_CLIENT_ID });

export function loadSealedSession(req: Request) {
  const sessionData = req.cookies['wos-session'] as string | undefined;
  return workos.userManagement.loadSealedSession({
    sessionData,
    cookiePassword: WORKOS_COOKIE_PASSWORD,
  });
}
