import {
  boolean,
  customType,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

// Postgres bytea — drizzle has no built-in helper for it.
let bytea = customType<{ data: Buffer; default: false }>({
  dataType() {
    return 'bytea'
  },
})

export let typeEnum = pgEnum('type', ['blog', 'snippet'])

export let statsTable = pgTable(
  'stats',
  {
    type: typeEnum().notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    views: integer('views').notNull().default(0),
    loves: integer('loves').notNull().default(0),
    applauses: integer('applauses').notNull().default(0),
    ideas: integer('ideas').notNull().default(0),
    bullseyes: integer('bullseyes').notNull().default(0),
  },
  ({ type, slug }) => {
    return {
      pk: primaryKey({ columns: [type, slug] }),
    }
  }
)

export type StatsType = (typeof typeEnum.enumValues)[number]
export type SelectStats = typeof statsTable.$inferSelect

/**
 * The shape returned by the `reading-time` package, stored verbatim so that
 * the rendering pipeline (which expects `readingTime.minutes`) keeps working.
 */
export type ReadingTime = {
  text: string
  minutes: number
  time: number
  words: number
}

/**
 * Blog posts, migrated from `data/blog/*.mdx` into the database so they can be
 * managed (CRUD) from the admin panel and edited online on read-only hosts.
 *
 * `bodyRaw` holds the editable MDX source; `bodyCode` holds the compiled
 * mdx-bundler IIFE string consumed by `MDXLayoutRenderer` (identical format to
 * contentlayer's `body.code`). Computed fields are stored so reads stay cheap.
 */
export let postsTable = pgTable('posts', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 512 }).notNull(),
  date: timestamp('date', { mode: 'string', withTimezone: true }).notNull(),
  lastmod: timestamp('lastmod', { mode: 'string', withTimezone: true }),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  draft: boolean('draft').notNull().default(false),
  summary: text('summary'),
  images: jsonb('images').$type<string[]>(),
  authors: jsonb('authors').$type<string[]>().notNull().default(['default']),
  layout: varchar('layout', { length: 64 }),
  bibliography: varchar('bibliography', { length: 255 }),
  canonicalUrl: varchar('canonical_url', { length: 512 }),
  bodyRaw: text('body_raw').notNull(),
  bodyCode: text('body_code').notNull(),
  readingTime: jsonb('reading_time').$type<ReadingTime>().notNull(),
  toc: jsonb('toc').notNull(),
  structuredData: jsonb('structured_data').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectPost = typeof postsTable.$inferSelect
export type InsertPost = typeof postsTable.$inferInsert

/**
 * Self-hosted comments (replacing Giscus as the storage layer). `approved`
 * defaults to true for a frictionless launch; flip the default to false to
 * gate new comments behind admin moderation.
 */
export let commentsTable = pgTable('comments', {
  id: serial('id').primaryKey(),
  postType: typeEnum('post_type').notNull().default('blog'),
  slug: varchar('slug', { length: 255 }).notNull(),
  author: varchar('author', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  content: text('content').notNull(),
  approved: boolean('approved').notNull().default(true),
  parentId: integer('parent_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectComment = typeof commentsTable.$inferSelect
export type InsertComment = typeof commentsTable.$inferInsert

/**
 * Uploaded images, stored as binary in the DB so uploads work on read-only
 * hosts (Vercel). Served via /api/images/<id>. Keep uploads small (≤ a few MB).
 */
export let imagesTable = pgTable('images', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  data: bytea('data').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectImage = typeof imagesTable.$inferSelect
export type InsertImage = typeof imagesTable.$inferInsert

/**
 * The canonical tag library, so the editor can offer existing tags to pick from
 * (and new ones get added here). `slug` is the github-slugger form used in URLs.
 */
export let tagsTable = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectTag = typeof tagsTable.$inferSelect
export type InsertTag = typeof tagsTable.$inferInsert
