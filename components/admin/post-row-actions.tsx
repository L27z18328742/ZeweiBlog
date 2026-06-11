'use client'

import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function PostRowActions({ id, slug, draft }: { id: number; slug: string; draft: boolean }) {
  let router = useRouter()
  let [deleting, setDeleting] = useState(false)

  async function onDelete() {
    if (!confirm(`确定删除帖子「${slug}」？此操作不可撤销。`)) return
    setDeleting(true)
    let res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('删除失败')
      setDeleting(false)
    }
  }

  let iconBtn =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors'

  return (
    <div className="flex items-center justify-end gap-1">
      {!draft && (
        <Link
          href={`/blog/${slug}`}
          target="_blank"
          title="查看"
          className={`${iconBtn} hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200`}
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      )}
      <Link
        href={`/admin/posts/${id}/edit`}
        title="编辑"
        className={`${iconBtn} hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400`}
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        onClick={onDelete}
        disabled={deleting}
        title="删除"
        className={`${iconBtn} hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/30 dark:hover:text-red-400`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
