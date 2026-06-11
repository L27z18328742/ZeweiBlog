import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { AdminPagination } from '~/components/admin/admin-pagination'
import { PostRowActions } from '~/components/admin/post-row-actions'
import { getPostRowsPaginated } from '~/db/posts'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

export default async function AdminPostsPage(props: { searchParams: Promise<{ page?: string }> }) {
  let { page: pageParam } = await props.searchParams
  let page = Math.max(1, Number(pageParam) || 1)
  let { rows: posts, total } = await getPostRowsPaginated(page, PAGE_SIZE)
  let totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            帖子
          </h1>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {total}
          </span>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-500"
        >
          <Plus className="h-4 w-4" />
          新建帖子
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80 text-xs uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
              <th className="px-5 py-3.5 font-semibold">标题</th>
              <th className="px-5 py-3.5 font-semibold">日期</th>
              <th className="px-5 py-3.5 font-semibold">状态</th>
              <th className="px-5 py-3.5 text-right font-semibold">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center">
                  <FileText className="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-400">暂无帖子，点击「新建帖子」开始。</p>
                </td>
              </tr>
            )}
            {posts.map((post) => (
              <tr
                key={post.id}
                className="group transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
              >
                <td className="max-w-md px-5 py-3.5">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="block truncate font-medium text-gray-900 transition-colors group-hover:text-primary-600 dark:text-gray-100 dark:group-hover:text-primary-400"
                    title={post.title}
                  >
                    {post.title}
                  </Link>
                  <span className="mt-0.5 block truncate font-mono text-xs text-gray-400">
                    {post.slug}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-gray-500 dark:text-gray-400">
                  {post.date.slice(0, 10)}
                </td>
                <td className="px-5 py-3.5">
                  {post.draft ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-400/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      草稿
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-400/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      已发布
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <PostRowActions id={post.id} slug={post.slug} draft={post.draft} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination basePath="/admin/posts" currentPage={page} totalPages={totalPages} />
    </div>
  )
}
