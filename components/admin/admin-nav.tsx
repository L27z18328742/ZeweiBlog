'use client'

import { clsx } from 'clsx'
import { FileText, LayoutDashboard, LogOut, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

let links = [
  { href: '/admin/posts', label: '帖子', icon: FileText },
  { href: '/admin/comments', label: '评论', icon: MessageSquare },
]

export function AdminNav() {
  let pathname = usePathname()
  let router = useRouter()

  // The login page shares this layout but should not show the admin chrome.
  if (pathname === '/admin/login') return null

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav className="mb-8 flex items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          <LayoutDashboard className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          后台管理
        </span>
        <div className="flex items-center gap-1">
          {links.map((link) => {
            let Icon = link.icon
            let active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          className="hidden text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 sm:inline"
        >
          查看站点 ↗
        </Link>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <LogOut className="h-3.5 w-3.5" />
          退出登录
        </button>
      </div>
    </nav>
  )
}
