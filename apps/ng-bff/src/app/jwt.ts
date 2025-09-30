// apps/ng-bff/src/app/jwt.ts
import * as jose from 'jose';
import { createPrivateKey, createPublicKey } from 'crypto';
import { JWT_PRIVATE_KEY_PEM, JWT_EXPIRES_SECS, JWT_ISSUER } from './config';

const privateKey = createPrivateKey(JWT_PRIVATE_KEY_PEM);
const publicKey = createPublicKey(JWT_PRIVATE_KEY_PEM);

export async function mintConvexJwt(subject: string, claims?: Record<string, unknown>) {
  const now = Math.floor(Date.now() / 1000);
  return await new jose.SignJWT(claims ?? {})
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: 'bff-key-1' })
    .setIssuer(JWT_ISSUER)
    .setSubject(subject)
    .setIssuedAt(now)
    .setExpirationTime(now + JWT_EXPIRES_SECS)
    .sign(privateKey);
}

export async function jwks() {
  const jwk = (await jose.exportJWK(publicKey)) as any;
  jwk.kid = 'bff-key-1';
  jwk.use = 'sig';
  jwk.alg = 'RS256';
  return { keys: [jwk] };
}
