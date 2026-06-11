import { getAllBlogPosts } from '~/db/posts'
import { ListLayout } from '~/layouts/list-layout'
import { POSTS_PER_PAGE } from '~/utils/const'
import { allCoreContent } from '~/utils/contentlayer'
import { sortPosts } from '~/utils/misc'

export const revalidate = 60

export let generateStaticParams = async () => {
  let allBlogs = await getAllBlogPosts()
  let totalPages = Math.ceil(allBlogs.length / POSTS_PER_PAGE)
  let paths = Array.from({ length: totalPages }, (_, i) => ({ page: (i + 1).toString() }))
  return paths
}

export default async function Page(props: { params: Promise<{ page: string }> }) {
  let params = await props.params
  let allBlogs = await getAllBlogPosts()
  let posts = allCoreContent(sortPosts(allBlogs))
  let pageNumber = parseInt(params.page as string)
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
