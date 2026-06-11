import { asc } from 'drizzle-orm'
import { slug as slugify } from 'github-slugger'
import { db } from './index'
import { type SelectTag, tagsTable } from './schema'

/** All tags in the library, alphabetical by name. */
export async function getAllTags(): Promise<SelectTag[]> {
  return db.select().from(tagsTable).orderBy(asc(tagsTable.name))
}

/**
 * Ensures each given tag name exists in the library (idempotent by slug).
 * Called on post save so newly-typed tags join the pickable set.
 */
export async function ensureTags(names: string[]): Promise<void> {
  let seen = new Set<string>()
  let values: { name: string; slug: string }[] = []
  for (let name of names) {
    let trimmed = name.trim()
    if (!trimmed) continue
    let s = slugify(trimmed)
    if (!s || seen.has(s)) continue
    seen.add(s)
    values.push({ name: trimmed, slug: s })
  }
  if (!values.length) return
  await db.insert(tagsTable).values(values).onConflictDoNothing({ target: tagsTable.slug })
}
