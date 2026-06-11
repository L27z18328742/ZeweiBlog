'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function AdminLoginPage() {
  let router = useRouter()
  let searchParams = useSearchParams()
  let from = searchParams.get('from') || '/admin/posts'
  let [password, setPassword] = useState('')
  let [error, setError] = useState('')
  let [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        let data = await res.json().catch(() => ({}))
        setError(data.message || '登录失败')
        setLoading(false)
        return
      }
      router.push(from)
      router.refresh()
    } catch {
      setError('网络错误，请重试')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">后台登录</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">请输入管理员密码以继续。</p>
        <div>
          <label htmlFor="password" className="sr-only">
            密码
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="管理员密码"
            required
            autoFocus
            className="w-full rounded-md border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600 dark:border-gray-600 dark:bg-black"
          />
        </div>
        {error && <div className="text-sm text-red-500 dark:text-red-400">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:ring-offset-black dark:hover:bg-primary-400"
        >
          {loading ? '登录中…' : '登录'}
        </button>
      </form>
    </div>
  )
}
