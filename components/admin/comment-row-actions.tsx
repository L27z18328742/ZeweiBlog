'use client'

import { Check, RotateCcw, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function CommentRowActions({ id, approved }: { id: number; approved: boolean }) {
  let router = useRouter()
  let [busy, setBusy] = useState(false)

  async function toggleApproved() {
    setBusy(true)
    let res = await fetch('/api/admin/comments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved: !approved }),
    })
    if (res.ok) router.refresh()
    else {
      alert('操作失败')
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm('确定删除这条评论？')) return
    setBusy(true)
    let res = await fetch(`/api/admin/comments?id=${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
    else {
      alert('删除失败')
      setBusy(false)
    }
  }

  let btn =
    'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50'

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <button
        onClick={toggleApproved}
        disabled={busy}
        className={`${btn} ${
          approved
            ? 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30'
        }`}
      >
        {approved ? <RotateCcw className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
        {approved ? '设为待审核' : '通过'}
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className={`${btn} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30`}
      >
        <Trash2 className="h-3.5 w-3.5" />
        删除
      </button>
    </div>
  )
}
