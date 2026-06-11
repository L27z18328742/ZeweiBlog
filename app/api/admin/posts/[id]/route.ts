import type { NextRequest } from 'next/server'
import { getPostRowById } from '~/db/posts'
import { deletePost, updatePost } from '~/db/posts-write'
import { normalizePostInput } from '~/utils/post-input'

export const maxDuration = 60

// GET → a single raw post row (editor loads the editable MDX source).
export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    let { id } = await props.params
    let row = await getPostRowById(Number(id))
    if (!row) return Response.json({ message: 'Not found' }, { status: 404 })
    return Response.json(row)
  } catch (e) {
    console.error(e)
    return Response.json({ message: 'Internal Server Error!' }, { status: 500 })
  }
}

// PUT → update a post (recompiles MDX).
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    let { id } = await props.params
    let body = await request.json()
    let input = normalizePostInput(body)
    if (!input) {
      return Response.json({ message: '缺少必填字段：slug / title / date / 内容' }, { status: 400 })
    }
    let updated = await updatePost(Number(id), input)
    if (!updated) return Response.json({ message: 'Not found' }, { status: 404 })
    return Response.json(updated)
  } catch (e) {
    console.error(e)
    let message = e instanceof Error ? e.message : 'Internal Server Error!'
    return Response.json({ message }, { status: 500 })
  }
}

// DELETE → remove a post.
export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    let { id } = await props.params
    await deletePost(Number(id))
    return Response.json({ ok: true })
  } catch (e) {
    console.error(e)
    return Response.json({ message: 'Internal Server Error!' }, { status: 500 })
  }
}
