import { z } from 'zod';
import fs from 'fs';
import path from 'path';

/** Normalize PEM that might be provided with literal "\n" sequences */
function normalizePem(input: string): string {
  let pem = input.trim();
  if (
    (pem.startsWith('"') && pem.endsWith('"')) ||
    (pem.startsWith("'") && pem.endsWith("'"))
  ) {
    pem = pem.slice(1, -1);
  }
  const looksMultiline = pem.includes('\n') || pem.includes('\r');
  const hasHeaders = pem.includes('-----BEGIN ') && pem.includes('-----END ');
  if (looksMultiline && hasHeaders) return pem.replace(/\r\n/g, '\n');
  return pem.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
}

function readFileIfExists(p?: string) {
  if (!p) return undefined;
  const abs = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
  return fs.readFileSync(abs, 'utf8');
}

/** Strongly-typed, validated environment */
const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),

    APP_URL: z.string().url().default('http://localhost:4200'),
    BFF_URL: z.string().url().default('http://localhost:3000'),

    // Cookie / CSRF
    COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),

    // Convex JWT (accept PEM or file path)
    BFF_PUBLIC_URL: z.string().url().optional(),
    JWT_EXPIRES_SECS: z.coerce.number().int().positive().default(90),
    JWT_PRIVATE_KEY_PEM: z.string().optional(),
    JWT_PRIVATE_KEY_FILE: z.string().optional(),
    CONVEX_APP_ID: z.string().default('bff-cnv-app'),

    // WorkOS
    WORKOS_API_KEY: z.string().min(1, 'WORKOS_API_KEY required'),
    WORKOS_CLIENT_ID: z.string().min(1, 'WORKOS_CLIENT_ID required'),
    WORKOS_COOKIE_PASSWORD: z
      .string()
      .min(32, 'WORKOS_COOKIE_PASSWORD must be >= 32 characters'),
  })
  .transform((e) => {
    const pemRaw =
      (e.JWT_PRIVATE_KEY_PEM && e.JWT_PRIVATE_KEY_PEM.trim()) ||
      readFileIfExists(e.JWT_PRIVATE_KEY_FILE);

    if (!pemRaw || !pemRaw.trim()) {
      throw new Error(
        'Provide JWT_PRIVATE_KEY_PEM (PEM contents) OR JWT_PRIVATE_KEY_FILE (path to PEM).'
      );
    }

    return {
      ...e,
      JWT_PRIVATE_KEY_PEM: normalizePem(pemRaw),
    };
  });

// Validate at startup; fail fast with a readable error
const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `• ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

const env = parsed.data;

// ---- Export typed, pre-validated constants ----
export const APP_URL = env.APP_URL;
export const BFF_URL = env.BFF_URL;
export const BFF_PUBLIC_URL = env.BFF_PUBLIC_URL ?? env.BFF_URL;

export const COOKIE_SECURE = env.NODE_ENV === 'production';
export const COOKIE_SAMESITE = env.COOKIE_SAMESITE;
export const CSRF_COOKIE = 'XSRF-TOKEN';
export const CSRF_HEADER = 'X-XSRF-TOKEN';

export const JWT_ISSUER = BFF_PUBLIC_URL;
export const JWT_EXPIRES_SECS = env.JWT_EXPIRES_SECS;
export const JWT_PRIVATE_KEY_PEM = env.JWT_PRIVATE_KEY_PEM;
export const CONVEX_APP_ID = env.CONVEX_APP_ID;

export const WORKOS_API_KEY = env.WORKOS_API_KEY;
export const WORKOS_CLIENT_ID = env.WORKOS_CLIENT_ID;
export const WORKOS_COOKIE_PASSWORD = env.WORKOS_COOKIE_PASSWORD;

export type AppEnv = z.infer<typeof EnvSchema>;
export const ENV: Readonly<AppEnv> = env;
