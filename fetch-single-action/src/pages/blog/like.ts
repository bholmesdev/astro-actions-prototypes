import { db, Likes, sql, eq } from "astro:db";

export const prerender = false;

export async function action({ postId }: { postId: string }) {
  await new Promise((r) => setTimeout(r, 200));
  const { likes } = await db
    .update(Likes)
    .set({
      likes: sql`likes + 1`,
    })
    .where(eq(Likes.postId, postId))
    .returning()
    .get();
  return { likes };
}
