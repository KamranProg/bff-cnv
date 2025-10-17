import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    externalId: v.string(), // WorkOS user id (e.g., "user_01J..."), unique
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    roles: v.optional(v.array(v.union(v.literal('user'), v.literal('admin')))),
    messages: v.optional(v.array(v.id('messages'))),
    posts: v.optional(v.array(v.id('posts'))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_externalId', ['externalId'])
    .index('by_email', ['email']),

  messages: defineTable({
    userId: v.id('users'), // message relation to a user
    body: v.string(),
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    coverImageId: v.optional(v.id('_storage')),
    authorId: v.id('users'), // post relation to a user
    likes: v.number(),
  }).index('bySlug', ['slug']),
});
