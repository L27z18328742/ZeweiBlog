import { genPageMetadata } from 'app/seo'
import { getAllBlogPosts } from '~/db/posts'
import { ListLayout } from '~/layouts/list-layout'
import { POSTS_PER_PAGE } from '~/utils/const'
import { allCoreContent } from '~/utils/contentlayer'
import { sortPosts } from '~/utils/misc'

export let metadata = genPageMetadata({ title: 'Blog' })

export const revalidate = 60

export default async function BlogPage() {
  let allBlogs = await getAllBlogPosts()
  let posts = allCoreContent(sortPosts(allBlogs))
  let pageNumber = 1
  let initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  let pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="我的博客"
    />
  )
}
