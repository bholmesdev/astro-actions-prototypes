import { db, Comment, Likes, eq, sql } from "astro:db";
import { action } from "../../integration/action";
import { z } from "zod";

const like = action(z.object({ postId: z.string() }), async ({ postId }) => {
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
});

const comment = action(
  z.object({ postId: z.string(), author: z.string(), body: z.string() }),
  async ({ postId, author, body }) => {
    await db.insert(Comment).values({
      postId,
      body,
      author,
    });
    return { success: true };
  }
);

export const actions = {
  blog: {
    like,
    comment,
  },
};
