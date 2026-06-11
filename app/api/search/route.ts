import { allSnippets } from 'contentlayer/generated'
import type { Blog, Snippet } from 'contentlayer/generated'
import { getAllBlogPosts } from '~/db/posts'
import { allCoreContent } from '~/utils/contentlayer'
import { sortPosts } from '~/utils/misc'

// kbar search index, served dynamically so admin-managed DB posts are always
// searchable (replaces the build-time public/search.json for blogs). Snippets
// still come from contentlayer.
export const revalidate = 60

export async function GET() {
  let allBlogs = await getAllBlogPosts()
  let merged = [...allBlogs, ...(allSnippets as unknown as Snippet[])] as (Blog | Snippet)[]
  let documents = allCoreContent(sortPosts(merged))
  return Response.json(documents)
}
