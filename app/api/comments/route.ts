import type { NextRequest } from 'next/server'
import { createComment, getComments } from '~/db/comments'
import type { StatsType } from '~/db/schema'

// GET ?slug=&type= → approved comments for a post.
export async function GET(request: NextRequest) {
  try {
    let { searchParams } = new URL(request.url)
    let slug = searchParams.get('slug')
    let type = (searchParams.get('type') as StatsType) || 'blog'
    if (!slug) {
      return Response.json({ message: 'Missing `slug` parameter!' }, { status: 400 })
    }
    let comments = await getComments(slug, type)
    return Response.json(comments)
  } catch (e) {
    console.error(e)
    return Response.json({ message: 'Internal Server Error!' }, { status: 500 })
  }
}

// POST → create a comment.
export async function POST(request: NextRequest) {
  try {
    let body = await request.json()
    let slug = typeof body.slug === 'string' ? body.slug : ''
    let author = typeof body.author === 'string' ? body.author.trim() : ''
    let content = typeof body.content === 'string' ? body.content.trim() : ''
    let type = (body.type as StatsType) || 'blog'

    if (!slug || !author || !content) {
      return Response.json({ message: '昵称和评论内容不能为空' }, { status: 400 })
    }
    // Basic abuse guards.
    if (author.length > 100) {
      return Response.json({ message: '昵称过长' }, { status: 400 })
    }
    if (content.length > 5000) {
      return Response.json({ message: '评论内容过长（上限 5000 字）' }, { status: 400 })
    }

    let comment = await createComment({
      slug,
      postType: type,
      author,
      email: typeof body.email === 'string' && body.email.trim() ? body.email.trim() : null,
      content,
    })
    return Response.json(comment, { status: 201 })
  } catch (e) {
    console.error(e)
    return Response.json({ message: 'Internal Server Error!' }, { status: 500 })
  }
}
