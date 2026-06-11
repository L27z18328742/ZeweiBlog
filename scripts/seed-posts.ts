import { config } from 'dotenv'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'

config({ path: '.env' })

let BLOG_DIR = path.join(process.cwd(), 'data', 'blog')

/** Normalizes a frontmatter date to an ISO string. */
function toISO(value: unknown): string {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return new Date(value).toISOString()
  return new Date().toISOString()
}

function toStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return [value]
  return undefined
}

async function main() {
  // Imported lazily so dotenv is configured before db/index.ts reads DATABASE_URL.
  let { upsertPostBySlug } = await import('~/db/posts-write')

  let files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))
  console.log(`Found ${files.length} MDX files in data/blog\n`)

  let ok = 0
  let failed = 0
  for (let file of files) {
    let slug = file.replace(/\.mdx$/, '')
    let raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
    let { data, content } = matter(raw)

    if (!data.title || !data.date) {
      console.warn(`⏭️  Skipped ${file} (missing title or date)`)
      failed++
      continue
    }

    try {
      await upsertPostBySlug({
        slug,
        title: String(data.title),
        date: toISO(data.date),
        lastmod: data.lastmod ? toISO(data.lastmod) : null,
        tags: toStringArray(data.tags) ?? [],
        draft: data.draft === true,
        summary: data.summary ? String(data.summary) : null,
        images: toStringArray(data.images) ?? null,
        authors: toStringArray(data.authors) ?? ['default'],
        layout: data.layout ? String(data.layout) : null,
        bibliography: data.bibliography ? String(data.bibliography) : null,
        canonicalUrl: data.canonicalUrl ? String(data.canonicalUrl) : null,
        bodyRaw: content,
      })
      console.log(`✅ ${slug}`)
      ok++
    } catch (e) {
      console.error(`❌ ${slug}:`, e instanceof Error ? e.message : e)
      failed++
    }
  }

  console.log(`\nDone. ${ok} seeded, ${failed} failed/skipped.`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
