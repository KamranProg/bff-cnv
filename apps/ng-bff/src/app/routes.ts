import { z } from 'zod';
import { Router, type Request, type Response } from 'express';
import {
  APP_URL,
  BFF_URL,
  COOKIE_SECURE,
  COOKIE_SAMESITE,
  WORKOS_CLIENT_ID,
  WORKOS_COOKIE_PASSWORD,
} from './config';
import { workos, loadSealedSession } from './workos';
import type { WorkOSUser } from './workos';

import { issueCsrfCookie, requireCsrf } from './csrf';
import { mintConvexJwt, jwks } from './jwt';

export const routes = Router();

/* ──────────────────────────────────────────────────────────────────────────────
 * New: Zod helpers + schemas to (a) normalize WorkOS user profile fields,
 * (b) build OIDC-style claims, and (c) drop undefined/empty values safely.
 * This keeps code strict-TS with no `any`, and avoids emitting empty claims.
 * ────────────────────────────────────────────────────────────────────────────*/

// Treat empty strings as "missing" and trim; output type: string | undefined
const optStr = () => z.string().trim().min(1).optional().catch(undefined);

// Only the WorkOS user fields we actually need; ignore the rest via .passthrough()
const WorkOsUserForClaims = z
  .object({
    id: z.string(),
    email: optStr(),
    firstName: optStr(),
    lastName: optStr(),
    profilePictureUrl: optStr(),
    imageUrl: optStr(),
  })
  .passthrough();

// Build OIDC claims (email, given_name, family_name, picture, name) and
// drop any undefined values via transform -> returns Record<string, string>.
const ClaimsSchema = z
  .object({
    email: optStr(),
    given_name: optStr(),
    family_name: optStr(),
    picture: optStr(),
    name: optStr(),
  })
  .transform((obj) => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string') out[k] = v;
    }
    return out;
  });

/**
 * New: helper that accepts a WorkOSUser (typed by SDK), validates/normalizes
 * with Zod, then returns a minimal, clean set of OIDC claims.
 * Claims are display-only (profile hints). Do not use JWT claims for authorization—derive roles/permissions from your Convex DB.
 */
function buildClaimsFromWorkOSUser(u: WorkOSUser): Record<string, string> {
  const parsed = WorkOsUserForClaims.parse(u);
  return ClaimsSchema.parse({
    email: parsed.email?.toLowerCase(),
    given_name: parsed.firstName,
    family_name: parsed.lastName,
    picture: parsed.profilePictureUrl ?? parsed.imageUrl,
    name:
      parsed.firstName && parsed.lastName
        ? `${parsed.firstName} ${parsed.lastName}`
        : undefined,
  });
}

/**
 * GET /auth/login
 * Server-side: generate AuthKit authorization URL and redirect user to it.
 * Make sure ${BFF_URL}/auth/callback is added to Allowed Redirect URLs in the WorkOS dashboard.
 */
routes.get('/auth/login', async (_req, res) => {
  const authorizationUrl = workos.userManagement.getAuthorizationUrl({
    provider: 'authkit',
    redirectUri: `${BFF_URL}/auth/callback`,
    clientId: WORKOS_CLIENT_ID,
  });
  res.redirect(authorizationUrl);
});

/**
 * GET /auth/callback
 * Server-side: exchange ?code for an authenticated User AND a sealed session.
 * Store the sealed session as an HttpOnly cookie (`wos-session`).
 */
routes.get('/auth/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).send('No code');

  try {
    const { sealedSession } = await workos.userManagement.authenticateWithCode({
      clientId: WORKOS_CLIENT_ID,
      code,
      session: {
        sealSession: true,
        cookiePassword: WORKOS_COOKIE_PASSWORD,
      },
    });

    res.cookie('wos-session', sealedSession, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAMESITE,
      path: '/',
    });

    // Also issue CSRF cookie for POST/PUT/PATCH/DELETE
    issueCsrfCookie(res);
    // Redirect home or to your app target
    return res.redirect(`${APP_URL}/dashboard`);
  } catch {
    return res.redirect('/auth/login');
  }
});

/**
 * GET /api/me
 * Load sealed session, authenticate (or refresh if needed), and return minimal user info.
 */
routes.get('/api/me', async (req: Request, res: Response) => {
  const session = loadSealedSession(req);
  const result = await session.authenticate();

  if (result.authenticated) {
    const { user } = result;
    return res.json({
      id: user.id,
      email: user.email,
      roles: ['user'],
    });
  }

  // If missing/invalid, try refresh (may update cookie)
  try {
    const refreshed = await session.refresh();
    if (!refreshed.authenticated)
      return res.status(401).json({ error: 'unauthenticated' });

    res.cookie('wos-session', refreshed.sealedSession, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAMESITE,
      path: '/',
    });
    return res.redirect(req.originalUrl);
  } catch {
    res.clearCookie('wos-session', { path: '/' });
    return res.status(401).json({ error: 'unauthenticated' });
  }
});

/**
 * POST /auth/logout
 * End the session at WorkOS, clear our cookie, and redirect to WorkOS logout URL.
 */
routes.post('/auth/logout', async (req: Request, res: Response) => {
  requireCsrf(req);

  const session = loadSealedSession(req);
  try {
    const url = await session.getLogoutUrl();
    res.clearCookie('wos-session', { path: '/' });
    return res.redirect(url);
  } catch {
    res.clearCookie('wos-session', { path: '/' });
    return res.status(204).end();
  }
});

/**
 * GET /api/convex-token
 * Requires a valid WorkOS session. Mints a short-lived RS256 JWT for Convex
 * using the WorkOS user id as the subject (`sub`).
 * JWT params: `iss = BFF_PUBLIC_URL`, `aud = CONVEX_APP_ID`, `kid = 'bff-key-1'`.
 * JWKS is served at `/.well-known/jwks.json`.
 * Includes minimal OIDC-style claims (`email`, `given_name`, `family_name`, `picture`, optional `name`)
 * so Convex exposes typed identity fields (`email`, `givenName`, `familyName`, `pictureUrl`).
 */
routes.get('/api/convex-token', async (req, res) => {
  const session = loadSealedSession(req);

  const a = await session.authenticate(); // A: AuthCookie* type
  if (a.authenticated) {
    const claims = buildClaimsFromWorkOSUser(a.user);
    const token = await mintConvexJwt(a.user.id, claims);
    return res.json({ token });
  }

  // Not authenticated → try refresh (different type!)
  const r = await session.refresh(); // B: RefreshSession* type
  if (!r.authenticated)
    return res.status(401).json({ error: 'unauthenticated' });

  res.cookie('wos-session', r.sealedSession, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAMESITE,
    path: '/',
  });

  const claims = buildClaimsFromWorkOSUser(r.user);
  const token = await mintConvexJwt(r.user.id, claims);
  return res.json({ token });
});

/**
 * GET /.well-known/jwks.json
 * Public JWKS so Convex can validate RS256 tokens minted above.
 */
routes.get('/.well-known/jwks.json', async (_req: Request, res: Response) => {
  res.json(await jwks());
});
