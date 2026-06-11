import type { NextRequest } from 'next/server'
import { getAllPostRows } from '~/db/posts'
import { createPost } from '~/db/posts-write'
import { normalizePostInput } from '~/utils/post-input'

// Compiling MDX with esbuild can take a few seconds on cold start.
export const maxDuration = 60

// GET → all post rows (admin list view).
export async function GET() {
  try {
    let rows = await getAllPostRows()
    return Response.json(rows)
  } catch (e) {
    console.error(e)
    return Response.json({ message: 'Internal Server Error!' }, { status: 500 })
  }
}

// POST → create a new post (compiles MDX server-side).
export async function POST(request: NextRequest) {
  try {
    let body = await request.json()
    let input = normalizePostInput(body)
    if (!input) {
      return Response.json({ message: '缺少必填字段：slug / title / date / 内容' }, { status: 400 })
    }
    let created = await createPost(input)
    return Response.json(created, { status: 201 })
  } catch (e) {
    console.error(e)
    let message = e instanceof Error ? e.message : 'Internal Server Error!'
    // MDX compile errors are the common failure — surface them to the editor.
    return Response.json({ message }, { status: 500 })
  }
}
