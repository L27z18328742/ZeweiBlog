import type { NextRequest } from 'next/server'
import { createImage } from '~/db/images'

export const runtime = 'nodejs'

const MAX_SIZE = 8 * 1024 * 1024 // 8MB upload cap (compressed before storing)
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_WIDTH = 1600 // downscale wider images; plenty for blog content

// POST multipart/form-data { file } → compresses, stores, returns { url, id }.
export async function POST(request: NextRequest) {
  try {
    let form = await request.formData()
    let file = form.get('file')
    if (!(file instanceof File)) {
      return Response.json({ message: '未收到文件' }, { status: 400 })
    }
    if (!ALLOWED.includes(file.type)) {
      return Response.json({ message: '仅支持 JPG/PNG/WebP/GIF/AVIF 图片' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return Response.json({ message: '图片过大（上限 8MB）' }, { status: 400 })
    }

    let original = Buffer.from(await file.arrayBuffer())
    let { data, mimeType } = await compress(original, file.type)

    let saved = await createImage({
      filename: file.name || 'upload',
      mimeType,
      size: data.length,
      data,
    })
    return Response.json({ id: saved.id, url: `/api/images/${saved.id}` }, { status: 201 })
  } catch (e) {
    console.error(e)
    return Response.json({ message: 'Internal Server Error!' }, { status: 500 })
  }
}

/**
 * Downscale + re-encode to WebP so stored images stay small (a few tens of KB),
 * which keeps DB reads — and therefore image serving — fast. Animated GIFs are
 * stored as-is to preserve animation. Falls back to the original on any error.
 */
async function compress(input: Buffer, mime: string): Promise<{ data: Buffer; mimeType: string }> {
  if (mime === 'image/gif') return { data: input, mimeType: mime }
  try {
    let sharp = (await import('sharp')).default
    let data = await sharp(input)
      .rotate() // honor EXIF orientation
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()
    // If WebP somehow ended up larger, keep the original.
    if (data.length >= input.length) return { data: input, mimeType: mime }
    return { data, mimeType: 'image/webp' }
  } catch (e) {
    console.error('image compression failed, storing original:', e)
    return { data: input, mimeType: mime }
  }
}
