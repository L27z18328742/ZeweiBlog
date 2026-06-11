import type { NextRequest } from 'next/server'
import { deleteComment, getAllComments, setCommentApproved } from '~/db/comments'

// GET → all comments (admin moderation view).
export async function GET() {
  try {
    let comments = await getAllComments()
    return Response.json(comments)
  } catch (e) {
    console.error(e)
    return Response.json({ message: 'Internal Server Error!' }, { status: 500 })
  }
}

// PATCH { id, approved } → toggle approval.
export async function PATCH(request: NextRequest) {
  try {
    let { id, approved } = await request.json()
    if (typeof id !== 'number' || typeof approved !== 'boolean') {
      return Response.json({ message: 'Missing `id` or `approved`' }, { status: 400 })
    }
    let updated = await setCommentApproved(id, approved)
    return Response.json(updated)
  } catch (e) {
    console.error(e)
    return Response.json({ message: 'Internal Server Error!' }, { status: 500 })
  }
}

// DELETE ?id= → remove a comment.
export async function DELETE(request: NextRequest) {
  try {
    let { searchParams } = new URL(request.url)
    let id = Number(searchParams.get('id'))
    if (!id) {
      return Response.json({ message: 'Missing `id`' }, { status: 400 })
    }
    await deleteComment(id)
    return Response.json({ ok: true })
  } catch (e) {
    console.error(e)
    return Response.json({ message: 'Internal Server Error!' }, { status: 500 })
  }
}
