import { eq } from 'drizzle-orm'
import { buildStructuredData, compilePostMDX } from '~/utils/compile-mdx'
import { db } from './index'
import { type InsertPost, postsTable, type SelectPost } from './schema'
import { ensureTags } from './tags'

// WRITE path for posts. Imports the MDX compiler (mdx-bundler/esbuild), so this
// module must only be imported by admin API routes and the seed script — never
// by public blog render paths (see db/posts.ts).

export type PostInput = {
  slug: string
  title: string
  date: string
  lastmod?: string | null
  tags?: string[]
  draft?: boolean
  summary?: string | null
  images?: string[] | null
  authors?: string[]
  layout?: string | null
  bibliography?: string | null
  canonicalUrl?: string | null
  bodyRaw: string
}

/** Compiles MDX + computes derived fields, returning a row ready to insert/update. */
async function toRow(input: PostInput): Promise<InsertPost> {
  let compiled = await compilePostMDX(input.bodyRaw)
  let structuredData = buildStructuredData({
    title: input.title,
    date: input.date,
    lastmod: input.lastmod,
    summary: input.summary,
    images: input.images,
    slug: input.slug,
  })
  return {
    slug: input.slug,
    title: input.title,
    date: input.date,
    lastmod: input.lastmod ?? null,
    tags: input.tags ?? [],
    draft: input.draft ?? false,
    summary: input.summary ?? null,
    images: input.images ?? null,
    authors: input.authors ?? ['default'],
    layout: input.layout ?? null,
    bibliography: input.bibliography ?? null,
    canonicalUrl: input.canonicalUrl ?? null,
    bodyRaw: input.bodyRaw,
    bodyCode: compiled.code,
    readingTime: compiled.readingTime,
    toc: compiled.toc,
    structuredData,
  }
}

export async function createPost(input: PostInput): Promise<SelectPost> {
  let row = await toRow(input)
  let inserted = await db.insert(postsTable).values(row).returning()
  await ensureTags(row.tags ?? [])
  return inserted[0]
}

export async function updatePost(id: number, input: PostInput): Promise<SelectPost> {
  let row = await toRow(input)
  let updated = await db
    .update(postsTable)
    .set({ ...row, updatedAt: new Date() })
    .where(eq(postsTable.id, id))
    .returning()
  await ensureTags(row.tags ?? [])
  return updated[0]
}

export async function deletePost(id: number): Promise<void> {
  await db.delete(postsTable).where(eq(postsTable.id, id))
}

/** Upsert by slug — used by the seed script so it is safely re-runnable. */
export async function upsertPostBySlug(input: PostInput): Promise<SelectPost> {
  let row = await toRow(input)
  let upserted = await db
    .insert(postsTable)
    .values(row)
    .onConflictDoUpdate({
      target: postsTable.slug,
      set: { ...row, updatedAt: new Date() },
    })
    .returning()
  return upserted[0]
}
