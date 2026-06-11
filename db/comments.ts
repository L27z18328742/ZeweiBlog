import { and, desc, eq } from 'drizzle-orm'
import { db } from './index'
import { commentsTable, type InsertComment, type SelectComment, type StatsType } from './schema'

/** Public-facing comments for a post. Defaults to approved-only. */
export async function getComments(
  slug: string,
  type: StatsType = 'blog',
  { approvedOnly = true }: { approvedOnly?: boolean } = {}
): Promise<SelectComment[]> {
  let where = approvedOnly
    ? and(
        eq(commentsTable.slug, slug),
        eq(commentsTable.postType, type),
        eq(commentsTable.approved, true)
      )
    : and(eq(commentsTable.slug, slug), eq(commentsTable.postType, type))
  return db.select().from(commentsTable).where(where).orderBy(desc(commentsTable.createdAt))
}

export type CommentInput = {
  slug: string
  postType?: StatsType
  author: string
  email?: string | null
  content: string
  parentId?: number | null
}

export async function createComment(input: CommentInput): Promise<SelectComment> {
  let values: InsertComment = {
    slug: input.slug,
    postType: input.postType ?? 'blog',
    author: input.author,
    email: input.email ?? null,
    content: input.content,
    parentId: input.parentId ?? null,
  }
  let inserted = await db.insert(commentsTable).values(values).returning()
  return inserted[0]
}

export async function deleteComment(id: number): Promise<void> {
  await db.delete(commentsTable).where(eq(commentsTable.id, id))
}

export async function setCommentApproved(id: number, approved: boolean): Promise<SelectComment> {
  let updated = await db
    .update(commentsTable)
    .set({ approved })
    .where(eq(commentsTable.id, id))
    .returning()
  return updated[0]
}

/** All comments for the admin dashboard, newest first. */
export async function getAllComments(): Promise<SelectComment[]> {
  return db.select().from(commentsTable).orderBy(desc(commentsTable.createdAt))
}
