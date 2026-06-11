import { PostEditor, type PostFormValues } from '~/components/admin/post-editor'

let empty: PostFormValues = {
  slug: '',
  title: '',
  date: new Date().toISOString().slice(0, 10),
  lastmod: '',
  tags: '',
  summary: '',
  images: '',
  authors: 'default',
  layout: '',
  draft: false,
  bodyRaw: '# 标题\n\n开始写作…\n',
}

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">新建帖子</h1>
      <PostEditor initial={empty} />
    </div>
  )
}
