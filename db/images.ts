import { eq } from 'drizzle-orm'
import { db } from './index'
import { imagesTable, type SelectImage } from './schema'

// Image bytes are immutable per id, so cache them in memory after the first
// read. This keeps the image route instant on repeat requests — important
// because reading a large bytea over a slow DB link can take seconds, which
// otherwise makes the live preview's <img> look broken while it loads.
let cache = new Map<number, SelectImage>()
const MAX_CACHED = 50

export async function createImage(input: {
  filename: string
  mimeType: string
  size: number
  data: Buffer
}): Promise<SelectImage> {
  let inserted = await db.insert(imagesTable).values(input).returning()
  let row = inserted[0]
  cache.set(row.id, row)
  return row
}

export async function getImage(id: number): Promise<SelectImage | null> {
  let cached = cache.get(id)
  if (cached) return cached
  let rows = await db.select().from(imagesTable).where(eq(imagesTable.id, id)).limit(1)
  if (!rows.length) return null
  // Simple bounded cache: drop the oldest entry when over capacity.
  if (cache.size >= MAX_CACHED) {
    let oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(id, rows[0])
  return rows[0]
}
