import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import { bundleMDX } from 'mdx-bundler'
import path from 'path'
import readingTime from 'reading-time'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeCitation from 'rehype-citation'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { remarkAlert } from 'remark-github-blockquote-alert'
import remarkMath from 'remark-math'
import { SITE_METADATA } from '~/data/site-metadata'
import type { ReadingTime } from '~/db/schema'
import { remarkCodeTitles } from '~/utils/remark-code-titles'
import { remarkExtractFrontmatter } from '~/utils/remark-extract-frontmatter'
import { remarkImgToJsx } from '~/utils/remark-img-to-jsx'
import { extractTocHeadings, type Toc } from '~/utils/remark-toc-headings'

let root = process.cwd()

// heroicon mini link — identical to contentlayer.config.ts so autolinked
// headings render the same anchor icon.
let icon = fromHtmlIsomorphic(
  `
    <span class="content-header-link">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 linkicon">
    <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
    <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
    </svg>
    </span>
  `,
  { fragment: true }
)

export type CompiledPost = {
  /** mdx-bundler IIFE string, identical in format to contentlayer's body.code */
  code: string
  readingTime: ReadingTime
  toc: Toc
}

/**
 * Compiles raw MDX into the same artifacts contentlayer produced at build time,
 * so DB-backed posts render through the unchanged `MDXLayoutRenderer`.
 *
 * The remark/rehype chain mirrors `contentlayer.config.ts` exactly. mdx-bundler
 * is what contentlayer2 uses internally, so the emitted `code` is byte-compatible
 * with the `new Function(React, ReactDOM, _jsx_runtime, code)` evaluator in
 * `components/mdx/layout-renderer.tsx`.
 */
export async function compilePostMDX(source: string): Promise<CompiledPost> {
  // esbuild ships per-platform binaries; on Windows mdx-bundler needs this hint.
  if (process.platform === 'win32') {
    process.env.ESBUILD_BINARY_PATH = path.join(root, 'node_modules', 'esbuild', 'esbuild.exe')
  } else {
    process.env.ESBUILD_BINARY_PATH = path.join(root, 'node_modules', 'esbuild', 'bin', 'esbuild')
  }

  let { code } = await bundleMDX({
    source,
    // cwd lets remarkImgToJsx resolve image dimensions from /public.
    cwd: root,
    mdxOptions(options) {
      options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        remarkExtractFrontmatter,
        remarkGfm,
        remarkCodeTitles,
        remarkMath,
        remarkImgToJsx,
        remarkAlert,
      ]
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'prepend',
            headingProperties: { className: ['content-header'] },
            content: icon,
          },
        ],
        [rehypeCitation, { path: path.join(root, 'data') }],
        [
          rehypePrettyCode,
          {
            theme: { dark: 'github-dark-dimmed', light: 'solarized-light' },
          },
        ],
        // NOTE: contentlayer also runs rehypePresetMinify here, but it pulls in
        // uglify-js, which reads its own source files via fs and breaks under
        // webpack bundling. It only minifies output HTML (visually identical),
        // so it is intentionally omitted from the runtime compile.
      ]
      return options
    },
  })

  let toc = await extractTocHeadings(source)

  return {
    code,
    readingTime: readingTime(source) as ReadingTime,
    toc,
  }
}

/**
 * Builds the schema.org BlogPosting object, matching the computed field in
 * `contentlayer.config.ts`. `author` is injected later in the blog page.
 */
export function buildStructuredData(post: {
  title: string
  date: string
  lastmod?: string | null
  summary?: string | null
  images?: string[] | null
  slug: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.date,
    dateModified: post.lastmod || post.date,
    description: post.summary,
    image: post.images && post.images.length ? post.images[0] : SITE_METADATA.socialBanner,
    url: `${SITE_METADATA.siteUrl}/blog/${post.slug}`,
  }
}
