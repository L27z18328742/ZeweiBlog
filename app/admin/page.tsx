import { redirect } from 'next/navigation'

// /admin has no content of its own — send users to the posts dashboard
// (middleware will bounce unauthenticated visitors to /admin/login first).
export default function AdminIndexPage() {
  redirect('/admin/posts')
}
