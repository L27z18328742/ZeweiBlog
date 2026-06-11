'use client'

import { useRef, useState } from 'react'

// Uploads an image to /api/admin/images and reports back the stored URL.
// `value` is a comma-separated list of image paths (matching the post schema).
export function ImageUploader({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  let fileRef = useRef<HTMLInputElement>(null)
  let [uploading, setUploading] = useState(false)
  let [error, setError] = useState('')

  let urls = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    let file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      let fd = new FormData()
      fd.append('file', file)
      let res = await fetch('/api/admin/images', { method: 'POST', body: fd })
      let data = await res.json()
      if (!res.ok) {
        setError(data.message || '上传失败')
      } else {
        onChange([...urls, data.url].join(', '))
      }
    } catch {
      setError('上传请求失败')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function removeAt(i: number) {
    onChange(urls.filter((_, idx) => idx !== i).join(', '))
  }

  return (
    <div className="space-y-2">
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {urls.map((url, i) => (
            <div key={url + i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="封面预览"
                className="h-20 w-32 rounded-md border border-gray-200 object-cover dark:border-gray-700"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                aria-label="移除图片"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFile}
          disabled={uploading}
          className="text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-500 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-primary-700 dark:text-gray-300"
        />
        {uploading && <span className="text-xs text-gray-400">上传中…</span>}
      </div>
      {error && <div className="text-sm text-red-500 dark:text-red-400">{error}</div>}
      <input
        className="w-full rounded-md border-gray-300 px-3 py-2 text-xs text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600 dark:border-gray-600 dark:bg-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="或手动填写图片路径（逗号分隔）"
      />
    </div>
  )
}
