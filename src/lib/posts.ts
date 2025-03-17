"use server";

import { db } from "@/server/db";
import { posts } from "@/server/db/schema";
import { desc, eq, and } from "drizzle-orm";

export type Post = typeof posts.$inferSelect;

export async function getBlogPosts() {
  return await db.query.posts.findMany({
    where: and(eq(posts.published, true)),
    orderBy: [desc(posts.publishedAt)],
    with: {
      author: {
        columns: {
          name: true,
          image: true,
        },
      },
    },
  });
}

export async function getBlogPostBySlug(slug: string) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
    with: {
      author: {
        columns: {
          name: true,
          image: true,
        },
      },
    },
  });

  return post;
}
