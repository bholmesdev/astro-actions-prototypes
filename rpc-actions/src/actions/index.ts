import { db, Comment, Likes, eq, sql } from "astro:db";
import { defineAction, formData } from "../../integration/action";
import { z } from "zod";

export default {
  blog: {
    like: defineAction({
      input: z.object({ postId: z.string() }),
      handler: async ({ postId }, context) => {
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
      },
    }),

    comment: defineAction({
      input: formData({
        postId: z.string(),
        author: z.string(),
        body: z.string(),
      }),
      handler: async ({ postId, author, body }) => {
        await db.insert(Comment).values({
          postId,
          body,
          author,
        });
      },
      onSuccess({ redirect, referer }) {
        return redirect(referer);
      },
    }),
  },
};
