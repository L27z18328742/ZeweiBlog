'use client'

import { slug as slugify } from 'github-slugger'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ImageUploader } from '~/components/admin/image-uploader'
import { MdxEditor } from '~/components/admin/mdx-editor'
import { MdxPreview } from '~/components/admin/mdx-preview'
import { TagSelector } from '~/components/admin/tag-selector'

/** Title → URL slug, collapsing the stray double dashes github-slugger emits. */
function toSlug(title: string): string {
  return slugify(title).replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export type PostFormValues = {
  slug: string
  title: string
  date: string
  lastmod: string
  tags: string
  summary: string
  images: string
  authors: string
  layout: string
  draft: boolean
  bodyRaw: string
}

let inputClass =
  'w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600 dark:border-gray-600 dark:bg-black'

let labelClass = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'

export function PostEditor({ initial, postId }: { initial: PostFormValues; postId?: number }) {
  let router = useRouter()
  let [values, setValues] = useState<PostFormValues>(initial)
  let [error, setError] = useState('')
  // New posts auto-generate the slug from the title; existing posts keep their
  // (immutable) slug. "customSlug" lets the user override the auto value.
  let [customSlug, setCustomSlug] = useState(false)

  function set<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function onTitleChange(title: string) {
    setValues((v) => {
      // For a new post with auto slug, keep the slug in sync with the title.
      let nextSlug = !postId && !customSlug ? toSlug(title) : v.slug
      return { ...v, title, slug: nextSlug }
    })
  }

  // tags/images are stored as comma-strings for the API; convert at the edges.
  let tagList = values.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  let [saving, setSaving] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    let url = postId ? `/api/admin/posts/${postId}` : '/api/admin/posts'
    let method = postId ? 'PUT' : 'POST'
    try {
      let res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        let data = await res.json().catch(() => ({}))
        setError(data.message || '保存失败（请检查 MDX 语法）')
        setSaving(false)
        return
      }
      router.push('/admin/posts')
      router.refresh()
    } catch {
      setError('网络错误，请重试')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>标题 *</label>
          <input
            className={inputClass}
            value={values.title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className={labelClass + ' mb-0'}>Slug（URL 路径）</label>
            {!postId && (
              <button
                type="button"
                onClick={() => {
                  if (customSlug) {
                    // back to auto: regenerate from current title
                    setCustomSlug(false)
                    set('slug', toSlug(values.title))
                  } else {
                    setCustomSlug(true)
                  }
                }}
                className="text-xs text-primary-600 hover:underline dark:text-primary-400"
              >
                {customSlug ? '改回自动生成' : '自定义'}
              </button>
            )}
          </div>
          <input
            className={inputClass + ' font-mono'}
            value={values.slug}
            onChange={(e) => set('slug', e.target.value)}
            required
            readOnly={!postId && !customSlug}
            disabled={!!postId}
            placeholder={!postId ? '随标题自动生成' : ''}
            title={
              postId
                ? 'Slug 创建后不可修改'
                : customSlug
                  ? ''
                  : '由标题自动生成，点击右上「自定义」可手动编辑'
            }
          />
        </div>
        <div>
          <label className={labelClass}>发布日期 *</label>
          <input
            type="date"
            className={inputClass}
            value={values.date}
            onChange={(e) => set('date', e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>更新日期</label>
          <input
            type="date"
            className={inputClass}
            value={values.lastmod}
            onChange={(e) => set('lastmod', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>作者（逗号分隔，对应 data/authors）</label>
          <input
            className={inputClass}
            value={values.authors}
            onChange={(e) => set('authors', e.target.value)}
            placeholder="default"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>标签</label>
        <TagSelector value={tagList} onChange={(next) => set('tags', next.join(', '))} />
      </div>

      <div>
        <label className={labelClass}>摘要</label>
        <input
          className={inputClass}
          value={values.summary}
          onChange={(e) => set('summary', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>封面图（可上传）</label>
          <ImageUploader value={values.images} onChange={(next) => set('images', next)} />
        </div>
        <div>
          <label className={labelClass}>布局（留空用默认 PostLayout）</label>
          <select
            className={inputClass}
            value={values.layout}
            onChange={(e) => set('layout', e.target.value)}
          >
            <option value="">PostLayout（默认）</option>
            <option value="PostSimple">PostSimple</option>
            <option value="PostBanner">PostBanner</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>可见性</label>
        <div className="inline-flex rounded-lg border border-gray-300 p-0.5 dark:border-gray-600">
          <button
            type="button"
            onClick={() => set('draft', false)}
            className={
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ' +
              (!values.draft
                ? 'bg-green-500 text-white'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200')
            }
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
            公开可见
          </button>
          <button
            type="button"
            onClick={() => set('draft', true)}
            className={
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ' +
              (values.draft
                ? 'bg-amber-500 text-white'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200')
            }
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
            不可见（草稿）
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {values.draft ? '设为不可见后，文章不会在站点公开显示。' : '公开可见，所有访客都能浏览。'}
        </p>
      </div>

      <div>
        <label className={labelClass}>正文（MDX）* — 左侧编辑，右侧实时预览</label>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Editor with toolbar + image upload */}
          <MdxEditor value={values.bodyRaw} onChange={(next) => set('bodyRaw', next)} />
          {/* Live preview */}
          <div className="min-h-[600px] overflow-auto rounded-md border border-gray-300 bg-white p-5 dark:border-gray-600 dark:bg-gray-950 lg:min-h-[64vh]">
            <MdxPreview bodyRaw={values.bodyRaw} />
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          工具栏可一键插入语法；图片可点「图片」按钮、拖拽或粘贴上传。右侧预览实时更新，保存时在服务端编译。
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary-500 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-primary-400"
        >
          {saving ? '保存中（编译 MDX）…' : values.draft ? '保存为草稿' : '保存并公开'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/posts')}
          disabled={saving}
          className="ml-auto rounded-md px-5 py-2 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-60 dark:text-gray-400 dark:hover:text-gray-200"
        >
          取消
        </button>
      </div>
    </form>
  )
}
