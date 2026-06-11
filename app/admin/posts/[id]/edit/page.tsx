import { notFound } from 'next/navigation'
import { PostEditor, type PostFormValues } from '~/components/admin/post-editor'
import { getPostRowById } from '~/db/posts'

export const dynamic = 'force-dynamic'

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
  let { id } = await props.params
  let row = await getPostRowById(Number(id))
  if (!row) return notFound()

  let initial: PostFormValues = {
    slug: row.slug,
    title: row.title,
    date: row.date.slice(0, 10),
    lastmod: row.lastmod ? row.lastmod.slice(0, 10) : '',
    tags: (row.tags ?? []).join(', '),
    summary: row.summary ?? '',
    images: (row.images ?? []).join(', '),
    authors: (row.authors ?? ['default']).join(', '),
    layout: row.layout ?? '',
    draft: row.draft,
    bodyRaw: row.bodyRaw,
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        编辑帖子：<span className="font-mono text-lg text-gray-500">{row.slug}</span>
      </h1>
      <PostEditor initial={initial} postId={row.id} />
    </div>
  )
}
