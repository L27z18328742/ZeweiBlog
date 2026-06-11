import { MessageSquare } from 'lucide-react'
import { CommentRowActions } from '~/components/admin/comment-row-actions'
import { getAllComments } from '~/db/comments'

export const dynamic = 'force-dynamic'

export default async function AdminCommentsPage() {
  let comments = await getAllComments()

  return (
    <div>
      <div className="mb-6 flex items-center gap-2.5">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">评论</h1>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {comments.length}
        </span>
      </div>

      {comments.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <MessageSquare className="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-400">暂无评论。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {c.author.slice(0, 1).toUpperCase()}
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{c.author}</span>
                {c.email && <span className="text-xs text-gray-400">{c.email}</span>}
                {c.approved ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-400/20">
                    已通过
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-400/20">
                    待审核
                  </span>
                )}
              </div>
              <p className="mb-3 whitespace-pre-wrap pl-9 text-sm text-gray-700 dark:text-gray-300">
                {c.content}
              </p>
              <div className="flex items-center justify-between pl-9">
                <a
                  href={`/${c.postType}/${c.slug}`}
                  target="_blank"
                  className="font-mono text-xs text-gray-400 transition-colors hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {c.postType}/{c.slug} · {new Date(c.createdAt).toLocaleString('zh-CN')}
                </a>
                <CommentRowActions id={c.id} approved={c.approved} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
