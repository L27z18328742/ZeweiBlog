import { clsx } from 'clsx'
import Link from 'next/link'

// Server-rendered pagination control for admin list views. Links carry the
// `?page=` param; page 1 omits it for a clean URL.
export function AdminPagination({
  basePath,
  currentPage,
  totalPages,
}: {
  basePath: string
  currentPage: number
  totalPages: number
}) {
  if (totalPages <= 1) return null

  let href = (page: number) => (page <= 1 ? basePath : `${basePath}?page=${page}`)

  // Compact window of page numbers around the current page.
  let pages: number[] = []
  let start = Math.max(1, currentPage - 2)
  let end = Math.min(totalPages, currentPage + 2)
  for (let p = start; p <= end; p++) pages.push(p)

  let baseBtn =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors'
  let idle =
    'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
  let active = 'border-primary-600 bg-primary-600 text-white shadow-sm'
  let disabled =
    'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600'

  let prevDisabled = currentPage <= 1
  let nextDisabled = currentPage >= totalPages

  return (
    <nav className="mt-6 flex items-center justify-between gap-2">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        第 {currentPage} / {totalPages} 页
      </div>
      <div className="flex items-center gap-1.5">
        {prevDisabled ? (
          <span className={clsx(baseBtn, disabled)}>上一页</span>
        ) : (
          <Link href={href(currentPage - 1)} className={clsx(baseBtn, idle)}>
            上一页
          </Link>
        )}

        {start > 1 && (
          <>
            <Link href={href(1)} className={clsx(baseBtn, idle)}>
              1
            </Link>
            {start > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}

        {pages.map((p) => (
          <Link
            key={p}
            href={href(p)}
            className={clsx(baseBtn, p === currentPage ? active : idle)}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </Link>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
            <Link href={href(totalPages)} className={clsx(baseBtn, idle)}>
              {totalPages}
            </Link>
          </>
        )}

        {nextDisabled ? (
          <span className={clsx(baseBtn, disabled)}>下一页</span>
        ) : (
          <Link href={href(currentPage + 1)} className={clsx(baseBtn, idle)}>
            下一页
          </Link>
        )}
      </div>
    </nav>
  )
}
