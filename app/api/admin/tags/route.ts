import type { NextRequest } from 'next/server'
import { ensureTags, getAllTags } from '~/db/tags'

// GET → the full tag library (for the editor's tag picker).
export async function GET() {
  try {
    let tags = await getAllTags()
    return Response.json(tags)
  } catch (e) {
    console.error(e)
    return Response.json({ message: 'Internal Server Error!' }, { status: 500 })
  }
}

// POST { names: string[] } → adds tags to the library (idempotent).
export async function POST(request: NextRequest) {
  try {
    let { names } = await request.json()
    if (!Array.isArray(names)) {
      return Response.json({ message: 'Missing `names` array' }, { status: 400 })
    }
    await ensureTags(names.map(String))
    let tags = await getAllTags()
    return Response.json(tags)
  } catch (e) {
    console.error(e)
    return Response.json({ message: 'Internal Server Error!' }, { status: 500 })
  }
}
