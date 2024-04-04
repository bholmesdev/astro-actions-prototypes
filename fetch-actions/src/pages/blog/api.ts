import { db, Comment, Likes, eq, sql } from "astro:db";

async function like({ postId }: { postId: string }) {
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

function test() {
  return "test";
}

async function comment(formData: FormData) {
  const postId = formData.get("postId") as string;
  const author = formData.get("author") as string;
  const body = formData.get("body") as string;
  await db.insert(Comment).values({
    postId,
    body,
    author,
  });
  return { success: true };
}

export const actions = {
  like,
  comment,
  test,
};
