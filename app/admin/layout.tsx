import type { ReactNode } from 'react'
import { AdminNav } from '~/components/admin/admin-nav'

export const metadata = {
  title: '后台管理',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <AdminNav />
      <main>{children}</main>
    </div>
  )
}
