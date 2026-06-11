'use client'

import { useEffect, useRef, useState } from 'react'
import { MDX_COMPONENTS } from '~/components/mdx'
import { MDXLayoutRenderer } from '~/components/mdx/layout-renderer'

// Live MDX preview: debounces the source, compiles it server-side via
// /api/admin/preview, and renders with the same components/styles as the blog.
// Keeps the last good render visible while recompiling so the pane never blanks.
export function MdxPreview({ bodyRaw }: { bodyRaw: string }) {
  let [code, setCode] = useState('')
  let [error, setError] = useState('')
  let [stale, setStale] = useState(false)
  // Tracks the in-flight request so out-of-order responses are ignored.
  let reqId = useRef(0)

  useEffect(() => {
    // Empty input → clear without hitting the API.
    if (!bodyRaw.trim()) {
      setCode('')
      setError('')
      setStale(false)
      return
    }
    setStale(true)
    let id = ++reqId.current
    let timer = setTimeout(async () => {
      try {
        let res = await fetch('/api/admin/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bodyRaw }),
        })
        let data = await res.json()
        if (id !== reqId.current) return // a newer keystroke superseded this
        if (!res.ok) {
          setError(data.message || '编译失败')
        } else {
          setError('')
          setCode(data.code)
        }
      } catch {
        if (id === reqId.current) setError('预览请求失败')
      } finally {
        if (id === reqId.current) setStale(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [bodyRaw])

  return (
    <div className="relative">
      {/* status pill */}
      <div className="pointer-events-none absolute right-2 top-2 z-10">
        {stale ? (
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            更新中…
          </span>
        ) : error ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] text-red-700 dark:bg-red-900/40 dark:text-red-300">
            语法错误
          </span>
        ) : null}
      </div>

      {error && (
        <div className="mb-3 max-h-32 overflow-auto rounded border border-red-300 bg-red-50 px-3 py-2 font-mono text-xs text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      {code ? (
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <MDXLayoutRenderer code={code} components={MDX_COMPONENTS} />
        </div>
      ) : (
        !error && <div className="text-sm text-gray-400">开始输入以查看预览…</div>
      )}
    </div>
  )
}
