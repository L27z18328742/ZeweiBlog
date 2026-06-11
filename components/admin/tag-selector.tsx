'use client'

import { clsx } from 'clsx'
import { useState } from 'react'
import useSWR from 'swr'
import type { SelectTag } from '~/db/schema'
import { fetcher } from '~/utils/misc'

// Multi-select tag picker backed by the DB tag library, with inline create.
// Value is the list of selected tag *names*.
export function TagSelector({
  value,
  onChange,
}: {
  value: string[]
  onChange: (next: string[]) => void
}) {
  let { data: tags, mutate } = useSWR<SelectTag[]>('/api/admin/tags', fetcher, {
    revalidateOnFocus: false,
  })
  let [input, setInput] = useState('')

  function toggle(name: string) {
    if (value.includes(name)) onChange(value.filter((t) => t !== name))
    else onChange([...value, name])
  }

  async function addNew() {
    let name = input.trim()
    if (!name) return
    if (!value.includes(name)) onChange([...value, name])
    setInput('')
    // Persist to the library so it's pickable next time.
    let res = await fetch('/api/admin/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names: [name] }),
    })
    if (res.ok) mutate(await res.json(), { revalidate: false })
  }

  let selected = new Set(value)

  return (
    <div className="space-y-2">
      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs text-primary-800 dark:bg-primary-900/40 dark:text-primary-200"
            >
              {name}
              <button
                type="button"
                onClick={() => toggle(name)}
                className="ml-0.5 text-primary-500 hover:text-primary-800 dark:hover:text-primary-100"
                aria-label={`移除 ${name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add new */}
      <div className="flex gap-2">
        <input
          className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600 dark:border-gray-600 dark:bg-black"
          placeholder="输入新标签后回车，或从下方勾选已有标签"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addNew()
            }
          }}
        />
        <button
          type="button"
          onClick={addNew}
          className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          添加
        </button>
      </div>

      {/* Existing library */}
      {tags && tags.length > 0 && (
        <div className="max-h-32 overflow-auto rounded-md border border-gray-200 p-2 dark:border-gray-700">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggle(tag.name)}
                className={clsx(
                  'rounded-full px-2.5 py-0.5 text-xs transition-colors',
                  selected.has(tag.name)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
