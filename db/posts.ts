import type { Blog } from 'contentlayer/generated'
import { desc, eq, sql } from 'drizzle-orm'
import { db } from './index'
import { postsTable, type SelectPost } from './schema'

// READ-ONLY post access. This module is imported by blog render paths, so it
// MUST NOT pull in the MDX compiler (mdx-bundler/esbuild) — that lives in
// `db/posts-write.ts`, imported only by admin/seed code. Keeping them apart
// stops webpack from bundling esbuild into the public blog routes.

// Columns for list views — everything EXCEPT the large `body_raw`/`body_code`
// text (which can be 100KB+ each). Listing/home/tags/sitemap render through
// `coreContent`, which strips `body`, so they never need it. Fetching it would
// pull megabytes per page load for no benefit.
let listColumns = {
  id: postsTable.id,
  slug: postsTable.slug,
  title: postsTable.title,
  date: postsTable.date,
  lastmod: postsTable.lastmod,
  tags: postsTable.tags,
  draft: postsTable.draft,
  summary: postsTable.summary,
  images: postsTable.images,
  authors: postsTable.authors,
  layout: postsTable.layout,
  bibliography: postsTable.bibliography,
  canonicalUrl: postsTable.canonicalUrl,
  readingTime: postsTable.readingTime,
  toc: postsTable.toc,
  structuredData: postsTable.structuredData,
}

type ListRow = {
  [K in keyof typeof listColumns]: SelectPost[K extends keyof SelectPost ? K : never]
}

/**
 * Maps a DB row to the contentlayer `Blog` shape so the existing rendering
 * pipeline (layouts, MDXLayoutRenderer, coreContent) works unchanged.
 * When `body` columns are absent (list queries) they default to empty strings.
 */
function rowToBlog(row: SelectPost | ListRow): Blog {
  let bodyRaw = 'bodyRaw' in row ? row.bodyRaw : ''
  let bodyCode = 'bodyCode' in row ? row.bodyCode : ''
  return {
    // contentlayer document internals — values are cosmetic for our render paths
    _id: `blog/${row.slug}.mdx`,
    _raw: {
      sourceFilePath: `blog/${row.slug}.mdx`,
      sourceFileName: `${row.slug}.mdx`,
      sourceFileDir: 'blog',
      contentType: 'mdx',
      flattenedPath: `blog/${row.slug}`,
    },
    type: 'Blog',
    title: row.title,
    date: row.date,
    tags: row.tags ?? [],
    lastmod: row.lastmod ?? undefined,
    draft: row.draft,
    summary: row.summary ?? undefined,
    images: row.images ?? undefined,
    authors: row.authors ?? undefined,
    layout: row.layout ?? undefined,
    bibliography: row.bibliography ?? undefined,
    canonicalUrl: row.canonicalUrl ?? undefined,
    body: { raw: bodyRaw, code: bodyCode },
    readingTime: row.readingTime,
    slug: row.slug,
    path: `blog/${row.slug}`,
    filePath: `blog/${row.slug}.mdx`,
    toc: row.toc,
    structuredData: row.structuredData,
  } as Blog
}

/**
 * All blog posts (WITHOUT body), newest first — for listing/home/tags/sitemap.
 * Drafts are included (callers filter via allCoreContent).
 */
export async function getAllBlogPosts(): Promise<Blog[]> {
  let rows = await db.select(listColumns).from(postsTable).orderBy(desc(postsTable.date))
  return rows.map(rowToBlog)
}

/** A single post WITH compiled body — for the blog detail page. */
export async function getBlogPostBySlug(slug: string): Promise<Blog | null> {
  let rows = await db.select().from(postsTable).where(eq(postsTable.slug, slug)).limit(1)
  return rows.length ? rowToBlog(rows[0]) : null
}

/** Raw row by id — used by the admin editor to load the editable MDX source. */
export async function getPostRowById(id: number): Promise<SelectPost | null> {
  let rows = await db.select().from(postsTable).where(eq(postsTable.id, id)).limit(1)
  return rows.length ? rows[0] : null
}

/**
 * Lightweight rows for the admin list view — excludes the large body columns
 * (the list only shows title/slug/date/draft). Avoids transferring MBs of MDX.
 */
export type PostListRow = {
  id: number
  slug: string
  title: string
  date: string
  draft: boolean
  updatedAt: Date
}
let listColumnsLite = {
  id: postsTable.id,
  slug: postsTable.slug,
  title: postsTable.title,
  date: postsTable.date,
  draft: postsTable.draft,
  updatedAt: postsTable.updatedAt,
}

export async function getAllPostRows(): Promise<PostListRow[]> {
  return db.select(listColumnsLite).from(postsTable).orderBy(desc(postsTable.date))
}

/**
 * A single page of admin list rows plus the total count, for server-side
 * pagination of the admin posts table.
 */
export async function getPostRowsPaginated(
  page: number,
  pageSize: number
): Promise<{ rows: PostListRow[]; total: number }> {
  let safePage = Math.max(1, Math.floor(page) || 1)
  let offset = (safePage - 1) * pageSize
  let [rows, countResult] = await Promise.all([
    db
      .select(listColumnsLite)
      .from(postsTable)
      .orderBy(desc(postsTable.date))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(postsTable),
  ])
  return { rows, total: countResult[0]?.count ?? 0 }
}

/**
 * Tag counts for DB-backed blog posts, keyed by slugified tag — replacing the
 * blog half of contentlayer's `json/tag-data.json`. Snippet tags are merged in
 * by `~/utils/tags` (snippets still come from contentlayer).
 */
export async function getBlogTagCounts(): Promise<Record<string, number>> {
  let { slug } = await import('github-slugger')
  let rows = await db.select({ tags: postsTable.tags, draft: postsTable.draft }).from(postsTable)
  let counts: Record<string, number> = {}
  let isProduction = process.env.NODE_ENV === 'production'
  for (let row of rows) {
    if (isProduction && row.draft) continue
    for (let tag of row.tags ?? []) {
      let key = slug(tag)
      counts[key] = (counts[key] ?? 0) + 1
    }
  }
  return counts
}
