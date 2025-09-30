import { Router, type Request, type Response } from 'express';
import { APP_URL, COOKIE_SECURE, COOKIE_SAMESITE } from './config';
import { workos, loadSealedSession } from './workos';
import { issueCsrfCookie, requireCsrf } from './csrf';
import { mintConvexJwt, jwks } from './jwt';

export const routes = Router();

/**
 * GET /auth/login
 * Server-side: generate AuthKit authorization URL and redirect user to it.
 * Configure this exact URL as the "Login endpoint" in WorkOS Redirects.
 */
routes.get('/auth/login', async (_req, res) => {
  const authorizationUrl = workos.userManagement.getAuthorizationUrl({
    provider: 'authkit',
    redirectUri: `${process.env.BFF_URL ?? 'http://localhost:3000'}/auth/callback`,
    clientId: process.env.WORKOS_CLIENT_ID!,
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
    const { user, sealedSession } = await workos.userManagement.authenticateWithCode({
      clientId: process.env.WORKOS_CLIENT_ID!,
      code,
      session: {
        sealSession: true,
        cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
      },
    });

    // Set the sealed session cookie
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
      roles: ['user'], // you can enrich from Convex later
    });
  }

  // If missing/invalid, try refresh (may update cookie)
  try {
    const refreshed = await session.refresh();
    if (!refreshed.authenticated) return res.status(401).json({ error: 'unauthenticated' });

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
 * Require a valid WorkOS session; mint a short-lived RS256 JWT for Convex
 * using the WorkOS user id as the subject.
 */
routes.get('/api/convex-token', async (req: Request, res: Response) => {
  const session = loadSealedSession(req);
  const result = await session.authenticate();

  if (!result.authenticated) return res.status(401).json({ error: 'unauthenticated' });

  const token = await mintConvexJwt(result.user.id, {
    email: result.user.email,
    // add roles/claims as needed for Convex authz
  });
  res.json({ token });
});

/**
 * GET /.well-known/jwks.json
 * Public JWKS so Convex can validate RS256 tokens minted above.
 */
routes.get('/.well-known/jwks.json', async (_req, res) => {
  res.json(await jwks());
});
