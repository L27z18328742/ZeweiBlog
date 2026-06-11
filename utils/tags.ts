import { allSnippets } from 'contentlayer/generated'
import { slug } from 'github-slugger'
import { getBlogTagCounts } from '~/db/posts'

let isProduction = process.env.NODE_ENV === 'production'

/**
 * Combined tag counts (slugified) across DB-backed blog posts and
 * contentlayer-backed snippets — the runtime replacement for the build-time
 * `json/tag-data.json` that contentlayer used to generate for blogs.
 */
export async function getTagCounts(): Promise<Record<string, number>> {
  let counts = await getBlogTagCounts()
  for (let snippet of allSnippets) {
    if (isProduction && snippet.draft) continue
    for (let tag of snippet.tags ?? []) {
      let key = slug(tag)
      counts[key] = (counts[key] ?? 0) + 1
    }
  }
  return counts
}
