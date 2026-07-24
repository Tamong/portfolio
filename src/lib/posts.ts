import "server-only";

import { cache } from "react";
import { db } from "@/server/db";
import { posts } from "@/server/db/schema";
import { desc, eq, and } from "drizzle-orm";

export type Post = typeof posts.$inferSelect;

export const getBlogPosts = cache(async () => {
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
});

/** Published posts only — drafts are reachable via the admin editor preview. */
export const getBlogPostBySlug = cache(async (slug: string) => {
  const post = await db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), eq(posts.published, true)),
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
});
