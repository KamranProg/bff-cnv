import { mutation, query } from './_generated/server';

export const listAll = query(async ({ db, auth }) => {
  const me = await auth.getUserIdentity();
  if (!me) return []; // or throw if you want private only
  return await db.query('messages').collect();
});

export const add = mutation(
  async ({ db, auth }, { body }: { body: string }) => {
    const me = await auth.getUserIdentity();
    if (!me) throw new Error('Unauthenticated');

    // get my user row
    const user = await db
      .query('users')
      .withIndex('by_externalId', (q) => q.eq('externalId', me.subject))
      .unique();

    if (!user)
      throw new Error('User row missing; call users.ensureCurrentUser() first');

    return await db.insert('messages', {
      userId: user._id,
      body,
      createdAt: Date.now(),
    });
  }
);
