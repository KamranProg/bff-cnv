import { mutation, query } from './_generated/server';
import type { Doc } from './_generated/dataModel';

/**
 * Safely read the first non-empty string value from an unknown object by trying
 * multiple candidate keys (in order).
 *
 * Why: With Convex `customJwt`, OIDC extras often appear as raw snake_case
 * keys (e.g. "given_name") rather than camelCase. This helper lets you read
 * those fields without using `any`, respects
 * `noPropertyAccessFromIndexSignature`, and ignores empty/whitespace values.
 *
 * @param obj  Unknown source object (e.g., identity from auth.getUserIdentity()).
 * @param keys Candidate property names to check, in priority order.
 * @returns    The trimmed string if found, otherwise `undefined`.
 *
 * @example
 * const firstName = claim(identity, "given_name", "givenName");
 * const lastName  = claim(identity, "family_name", "familyName");
 * const imageUrl  = claim(identity, "picture", "pictureUrl");
 */
function claim(obj: unknown, ...keys: string[]): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === 'string') {
      const s = v.trim();
      if (s) return s;
    }
  }
  return undefined;
}

// Ensure row exists for the current identity
export const ensureCurrentUser = mutation(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) throw new Error('Unauthenticated');
  if (!identity.email) throw new Error('Email missing in identity');

  const externalId = identity.subject;
  const email = identity.email.toLowerCase();
  const firstName = claim(identity, 'given_name', 'givenName');
  const lastName = claim(identity, 'family_name', 'familyName');
  const imageUrl = claim(identity, 'picture', 'pictureUrl');
  const existing = await db
    .query('users')
    .withIndex('by_externalId', (q) => q.eq('externalId', externalId))
    .unique();

  const now = Date.now();

  if (existing) {
    const patch: Partial<Doc<'users'>> = { updatedAt: now };
    if (existing.email !== email) patch.email = email;
    if (!existing.firstName && firstName) patch.firstName = firstName;
    if (!existing.lastName && lastName) patch.lastName = lastName;
    if (!existing.imageUrl && imageUrl) patch.imageUrl = imageUrl;
    if (Object.keys(patch).length > 1) await db.patch(existing._id, patch);
    return existing._id;
  }

  return await db.insert('users', {
    externalId,
    email,
    firstName,
    lastName,
    imageUrl,
    roles: ['user'],
    createdAt: now,
    updatedAt: now,
  });
});

// Helper: fetch current user's row
export const getCurrent = query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) return null;

  const user = await db
    .query('users')
    .withIndex('by_externalId', (q) => q.eq('externalId', identity.subject))
    .unique();

  return user;
});
