import type { PostInput } from '~/db/posts-write'

/** Validates + coerces a raw request body into a PostInput, or null if invalid. */
export function normalizePostInput(body: any): PostInput | null {
  if (!body || typeof body !== 'object') return null
  let { slug, title, date, bodyRaw } = body
  if (!slug || !title || !date || typeof bodyRaw !== 'string') return null
  return {
    slug: String(slug).trim(),
    title: String(title),
    date: new Date(date).toISOString(),
    lastmod: body.lastmod ? new Date(body.lastmod).toISOString() : null,
    tags: Array.isArray(body.tags)
      ? body.tags.map(String)
      : typeof body.tags === 'string'
        ? body.tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [],
    draft: body.draft === true,
    summary: body.summary ? String(body.summary) : null,
    images: Array.isArray(body.images)
      ? body.images.map(String)
      : typeof body.images === 'string' && body.images.trim()
        ? body.images
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : null,
    authors: Array.isArray(body.authors) ? body.authors.map(String) : ['default'],
    layout: body.layout ? String(body.layout) : null,
    bibliography: body.bibliography ? String(body.bibliography) : null,
    canonicalUrl: body.canonicalUrl ? String(body.canonicalUrl) : null,
    bodyRaw,
  }
}
