import * as jose from 'jose';
import { createPrivateKey, createPublicKey } from 'crypto';
import {
  CONVEX_APP_ID,
  JWT_PRIVATE_KEY_PEM,
  JWT_EXPIRES_SECS,
  JWT_ISSUER,
} from './config';

const privateKey = createPrivateKey(JWT_PRIVATE_KEY_PEM);
const publicKey = createPublicKey(JWT_PRIVATE_KEY_PEM);

// RS256 signing key advertised via JWKS (kid must match protected header).
type SigJwk = jose.JWK & { kid: string; use: 'sig'; alg: 'RS256' };

/**
 * Mint a short-lived RS256 JWT for Convex using the BFF private key.
 * - iss: public BFF URL (tunnel)
 * - aud: Convex app id
 * - kid: 'bff-key-1'
 */
export async function mintConvexJwt(
  subject: string,
  claims?: Record<string, unknown>
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await new jose.SignJWT(claims ?? {})
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: 'bff-key-1' })
    .setIssuer(JWT_ISSUER)
    .setAudience(CONVEX_APP_ID)
    .setSubject(subject)
    .setIssuedAt(now)
    .setExpirationTime(now + JWT_EXPIRES_SECS)
    .sign(privateKey);
}

/**
 * Return a JWKS containing the public RSA key so Convex can verify our JWTs.
 * Adds kid/use/alg to the exported JWK.
 */
export async function jwks(): Promise<{ keys: SigJwk[] }> {
  const base = (await jose.exportJWK(publicKey)) as jose.JWK;
  const key: SigJwk = { ...base, kid: 'bff-key-1', use: 'sig', alg: 'RS256' };
  return { keys: [key] };
}
