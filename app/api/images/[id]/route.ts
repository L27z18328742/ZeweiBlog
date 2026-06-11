import type { NextRequest } from 'next/server'
import { getImage } from '~/db/images'

// GET → serves a stored image's binary with long-lived caching (content is
// immutable per id).
export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    let { id } = await props.params
    let image = await getImage(Number(id))
    if (!image) return new Response('Not found', { status: 404 })
    return new Response(new Uint8Array(image.data), {
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e) {
    console.error(e)
    return new Response('Internal Server Error', { status: 500 })
  }
}
