'use client'

import {
  Bold,
  Code,
  Heading,
  Image as ImageIcon,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  SquareCode,
} from 'lucide-react'
import { useRef, useState } from 'react'

// MDX source editor with a formatting toolbar + image upload (button, drag,
// paste). Edits operate on the textarea selection and keep the cursor sensible.
export function MdxEditor({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (next: string) => void
  className?: string
}) {
  let taRef = useRef<HTMLTextAreaElement>(null)
  let fileRef = useRef<HTMLInputElement>(null)
  let [uploading, setUploading] = useState(false)
  let [dragOver, setDragOver] = useState(false)
  let [error, setError] = useState('')

  /** Replaces the current selection (or inserts at cursor) and restores focus. */
  function replaceSelection(
    transform: (selected: string) => { text: string; selectStart?: number; selectEnd?: number }
  ) {
    let ta = taRef.current
    if (!ta) return
    let start = ta.selectionStart
    let end = ta.selectionEnd
    let selected = value.slice(start, end)
    let { text, selectStart, selectEnd } = transform(selected)
    let next = value.slice(0, start) + text + value.slice(end)
    onChange(next)
    // Restore selection/cursor after React re-renders.
    requestAnimationFrame(() => {
      ta.focus()
      let s = start + (selectStart ?? text.length)
      let e = start + (selectEnd ?? selectStart ?? text.length)
      ta.setSelectionRange(s, e)
    })
  }

  /** Wraps selection with prefix/suffix; if empty, inserts placeholder selected. */
  function wrap(prefix: string, suffix: string, placeholder = '') {
    replaceSelection((sel) => {
      let inner = sel || placeholder
      return {
        text: prefix + inner + suffix,
        selectStart: prefix.length,
        selectEnd: prefix.length + inner.length,
      }
    })
  }

  /** Prepends a line marker (heading, list, quote) to each selected line. */
  function linePrefix(marker: string | ((i: number) => string)) {
    replaceSelection((sel) => {
      let lines = (sel || '').split('\n')
      let out = lines
        .map((l, i) => (typeof marker === 'function' ? marker(i) : marker) + l)
        .join('\n')
      return { text: out, selectStart: 0, selectEnd: out.length }
    })
  }

  function insertBlock(block: string, cursorOffset?: number) {
    replaceSelection(() => ({
      text: block,
      selectStart: cursorOffset ?? block.length,
      selectEnd: cursorOffset ?? block.length,
    }))
  }

  async function uploadAndInsert(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    setError('')
    try {
      let fd = new FormData()
      fd.append('file', file)
      let res = await fetch('/api/admin/images', { method: 'POST', body: fd })
      let data = await res.json()
      if (!res.ok) {
        setError(data.message || '图片上传失败')
        return
      }
      let alt = file.name.replace(/\.[^.]+$/, '')
      insertBlock(`![${alt}](${data.url})\n`)
    } catch {
      setError('图片上传请求失败')
    } finally {
      setUploading(false)
    }
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    let file = e.target.files?.[0]
    if (file) await uploadAndInsert(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    let img = Array.from(e.clipboardData.items).find((it) => it.type.startsWith('image/'))
    if (img) {
      e.preventDefault()
      let file = img.getAsFile()
      if (file) await uploadAndInsert(file)
    }
  }

  async function onDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    let file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'))
    if (file) {
      e.preventDefault()
      setDragOver(false)
      await uploadAndInsert(file)
    }
  }

  let tools: { icon: React.ElementType; title: string; run: () => void }[] = [
    { icon: Bold, title: '加粗', run: () => wrap('**', '**', '加粗文本') },
    { icon: Italic, title: '斜体', run: () => wrap('_', '_', '斜体文本') },
    { icon: Heading, title: '标题', run: () => linePrefix('## ') },
    { icon: Link2, title: '链接', run: () => wrap('[', '](https://)', '链接文字') },
    { icon: Code, title: '行内代码', run: () => wrap('`', '`', 'code') },
    {
      icon: SquareCode,
      title: '代码块',
      run: () => insertBlock('```js\n\n```\n', 6),
    },
    { icon: List, title: '无序列表', run: () => linePrefix('- ') },
    { icon: ListOrdered, title: '有序列表', run: () => linePrefix((i) => `${i + 1}. `) },
    { icon: Quote, title: '引用', run: () => linePrefix('> ') },
    {
      icon: Info,
      title: '提示块',
      run: () => insertBlock('> [!NOTE]\n> 提示内容\n', 9),
    },
  ]

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-b-0 border-gray-300 bg-gray-50 px-1.5 py-1 dark:border-gray-600 dark:bg-gray-800/60">
        {tools.map((t, i) => {
          let Icon = t.icon
          return (
            <button
              key={i}
              type="button"
              title={t.title}
              onClick={t.run}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
        <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />
        <button
          type="button"
          title="插入图片"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-8 items-center gap-1 rounded px-2 text-sm text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ImageIcon className="h-4 w-4" />
          {uploading ? '上传中…' : '图片'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickFile}
        />
      </div>

      {/* Textarea */}
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={onPaste}
        onDrop={onDrop}
        onDragOver={(e) => {
          if (Array.from(e.dataTransfer.types).includes('Files')) {
            e.preventDefault()
            setDragOver(true)
          }
        }}
        onDragLeave={() => setDragOver(false)}
        required
        spellCheck={false}
        placeholder="# 标题&#10;&#10;在这里写 Markdown / MDX…&#10;（可拖拽或粘贴图片自动上传）"
        className={
          'min-h-[600px] w-full resize-y rounded-b-md border px-3 py-2 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-600 dark:bg-black lg:min-h-[64vh] ' +
          (dragOver
            ? 'border-primary-500 ring-2 ring-primary-500'
            : 'border-gray-300 dark:border-gray-600')
        }
      />
      {error && <div className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</div>}
    </div>
  )
}
