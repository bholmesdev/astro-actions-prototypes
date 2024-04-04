import { db, Comment } from "astro:db";

export const prerender = false;

export async function action(formData: FormData) {
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
