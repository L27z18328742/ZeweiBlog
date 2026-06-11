'use client'

import { useState } from 'react'
import useSWR from 'swr'
import type { SelectComment } from '~/db/schema'
import { fetcher, getTimeAgo } from '~/utils/misc'

export function DbComments({
  slug,
  type = 'blog',
  className,
}: {
  slug: string
  type?: 'blog' | 'snippet'
  className?: string
}) {
  let key = `/api/comments?slug=${encodeURIComponent(slug)}&type=${type}`
  let {
    data: comments,
    isLoading,
    mutate,
  } = useSWR<SelectComment[]>(key, fetcher, {
    revalidateOnFocus: false,
  })

  let [author, setAuthor] = useState('')
  let [email, setEmail] = useState('')
  let [content, setContent] = useState('')
  let [submitting, setSubmitting] = useState(false)
  let [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      let res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type, author, email, content }),
      })
      if (!res.ok) {
        let data = await res.json().catch(() => ({}))
        setError(data.message || '提交失败')
        setSubmitting(false)
        return
      }
      let created = (await res.json()) as SelectComment
      // Optimistically prepend the new comment.
      mutate((prev) => [created, ...(prev ?? [])], { revalidate: false })
      setContent('')
      setSubmitting(false)
    } catch {
      setError('网络错误，请重试')
      setSubmitting(false)
    }
  }

  let inputClass =
    'w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600 dark:border-gray-600 dark:bg-black'

  return (
    <div id="comment" className={className}>
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
        评论 {comments ? `(${comments.length})` : ''}
      </h2>

      <form onSubmit={submit} className="mb-8 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className={inputClass}
            placeholder="昵称 *"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            maxLength={100}
          />
          <input
            className={inputClass}
            placeholder="邮箱（可选，不公开）"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <textarea
          className={inputClass + ' min-h-[100px]'}
          placeholder="写下你的评论…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          maxLength={5000}
        />
        {error && <div className="text-sm text-red-500 dark:text-red-400">{error}</div>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary-500 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60 dark:hover:bg-primary-400"
        >
          {submitting ? '提交中…' : '发表评论'}
        </button>
      </form>

      <div className="space-y-5">
        {isLoading && <p className="text-sm text-gray-400">加载评论中…</p>}
        {comments && comments.length === 0 && (
          <p className="text-sm text-gray-400">还没有评论，来抢沙发吧～</p>
        )}
        {comments?.map((c) => (
          <div key={c.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100">{c.author}</span>
              <span className="text-xs text-gray-400">
                {getTimeAgo(new Date(c.createdAt).getTime())}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {c.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
