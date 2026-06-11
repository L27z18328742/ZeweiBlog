import { config } from 'dotenv'
import type { Blog, Snippet } from 'contentlayer/generated'
import { mkdirSync, writeFileSync } from 'fs'
import { slug } from 'github-slugger'
import path from 'path'
import { allSnippets } from '~/.contentlayer/generated/index.mjs'
import { SITE_METADATA } from '~/data/site-metadata'
import { escape } from '~/utils/html-escaper'
import { sortPosts } from '~/utils/misc'

config({ path: '.env' })

const snippets = allSnippets as unknown as Snippet[]
const RSS_PAGE = 'feed.xml'

function generateRssItem(item: Blog | Snippet) {
  let { siteUrl, email, author } = SITE_METADATA
  return `
		<item>
			<guid>${siteUrl}/blog/${item.slug}</guid>
			<title>${escape(item.title)}</title>
			<link>${siteUrl}/blog/${item.slug}</link>
			${item.summary && `<description>${escape(item.summary)}</description>`}
			<pubDate>${new Date(item.date).toUTCString()}</pubDate>
			<author>${email} (${author})</author>
			${item.tags && item.tags.map((t) => `<category>${t}</category>`).join('')}
		</item>
	`
}

function generateRss(items: (Blog | Snippet)[], page = RSS_PAGE) {
  let { title, siteUrl, description, language, email, author } = SITE_METADATA
  return `
		<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
			<channel>
				<title>${escape(title)}</title>
				<link>${siteUrl}/blog</link>
				<description>${escape(description)}</description>
				<language>${language}</language>
				<managingEditor>${email} (${author})</managingEditor>
				<webMaster>${email} (${author})</webMaster>
				<lastBuildDate>${new Date(items[0].date).toUTCString()}</lastBuildDate>
				<atom:link href="${siteUrl}/${page}" rel="self" type="application/rss+xml"/>
				${items.map((item) => generateRssItem(item)).join('')}
			</channel>
		</rss>
	`
}

export async function generateRssFeed() {
  // Blogs now live in the DB; fetch them here (build-time, Node — safe to import
  // the read module). Snippets still come from contentlayer.
  let { getAllBlogPosts } = await import('~/db/posts')
  let blogs = (await getAllBlogPosts()) as unknown as Blog[]

  let publishPosts = blogs.filter((post) => post.draft !== true)
  let publishSnippets = snippets.filter((post) => post.draft !== true)
  // RSS for blog post & snippet
  if (publishPosts.length > 0 || publishSnippets.length > 0) {
    let rss = generateRss(sortPosts([...publishPosts, ...publishSnippets]))
    writeFileSync(`./public/${RSS_PAGE}`, rss)
  }

  if (publishPosts.length > 0 || publishSnippets.length > 0) {
    // Derive the tag set directly from posts/snippets (replaces tag-data.json).
    let tags = new Set<string>()
    for (let p of [...publishPosts, ...publishSnippets]) {
      for (let t of p.tags ?? []) tags.add(slug(t))
    }
    // RSS for tags
    for (let tag of tags) {
      let filteredPosts = publishPosts.filter((p) => p.tags.map((t) => slug(t)).includes(tag))
      let filteredSnippets = publishSnippets.filter((s) => s.tags.map((t) => slug(t)).includes(tag))
      let rss = generateRss([...filteredPosts, ...filteredSnippets], `tags/${tag}/feed.xml`)
      let rssPath = path.join('public', 'tags', tag)
      mkdirSync(rssPath, { recursive: true })
      writeFileSync(path.join(rssPath, RSS_PAGE), rss)
    }
  }
  console.log('🗒️. RSS feed generated.')
}
