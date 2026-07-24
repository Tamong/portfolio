import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { posts } from "@/server/db/schema";
import { and, desc, eq, like, lte, sql } from "drizzle-orm";
import { slugify } from "@/lib/utils";

/**
 * Regenerates the statically-cached pages that show post content. Called
 * after create/update/delete so published pages stay static until the next
 * save (never on views/comments).
 */
function revalidatePostPages(...slugs: (string | undefined)[]) {
  revalidatePath("/posts");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/posts/${slug}`);
  }
  revalidatePath("/sitemap.xml");
  revalidatePath("/llm");
  for (const format of ["rss.xml", "atom.xml", "feed.json"]) {
    revalidatePath(`/feed/${format}`);
  }
}

const postInputSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string(),
  summary: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
  image: z.string().optional(),
  publishedAt: z.date().optional(),
  published: z.boolean().optional(),
  slug: z.string().optional(),
});

export const postRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(50),
        cursor: z.string().optional(),
        onlyPublished: z.boolean().optional().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, onlyPublished } = input;

      const whereClause = onlyPublished
        ? and(eq(posts.published, true), lte(posts.publishedAt, new Date()))
        : undefined;

      const items = await ctx.db.query.posts.findMany({
        where: whereClause,
        limit: limit + 1,
        orderBy: [desc(posts.publishedAt)],
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.slug, input.slug),
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      if (
        !post ||
        (!post.published && post.authorId !== ctx.session?.user?.id)
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return post;
    }),

  create: protectedProcedure
    .input(postInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { title, content } = input;

      // Generate slug from title if not provided
      const slug = input.slug ?? slugify(title);

      // Check if slug already exists
      const existingPost = await ctx.db.query.posts.findFirst({
        where: eq(posts.slug, slug),
      });

      if (existingPost) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A post with this slug already exists",
        });
      }

      // Make sure we're not trying to use an identity column for a varchar ID
      const post = await ctx.db
        .insert(posts)
        .values({
          // Don't explicitly set the ID - let the default UUID function handle it
          title,
          content,
          slug,
          summary: input.summary ?? "",
          tags: input.tags ?? "",
          category: input.category ?? "",
          image: input.image,
          publishedAt: input.publishedAt ?? new Date(),
          authorId: ctx.session.user.id,
          published: input.published ?? false,
        })
        .returning();

      revalidatePostPages(slug);

      return post[0];
    }),

  update: protectedProcedure
    .input(
      z
        .object({
          id: z.string(),
        })
        .merge(postInputSchema.partial()),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check if post exists and user is author
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, id),
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (post.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update this post",
        });
      }

      // Update post
      const updatedPost = await ctx.db
        .update(posts)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id))
        .returning();

      // Revalidate the old slug too in case it changed
      revalidatePostPages(post.slug, updatedPost[0]?.slug);

      return updatedPost[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Check if post exists and user is author
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, id),
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (post.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete this post",
        });
      }

      await ctx.db.delete(posts).where(eq(posts.id, id));

      revalidatePostPages(post.slug);

      return { success: true };
    }),

  /**
   * Counts a view for a published post and returns the new total. Public,
   * intentionally does NOT revalidate the static page — counts are shown by
   * a client island, so the post itself stays cached.
   */
  registerView: publicProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db
        .update(posts)
        .set({
          views: sql`${posts.views} + 1`,
          // Pin updatedAt: its $onUpdate hook would otherwise mark the post
          // as edited on every view
          updatedAt: sql`${posts.updatedAt}`,
        })
        .where(and(eq(posts.slug, input.slug), eq(posts.published, true)))
        .returning({ views: posts.views });

      return { views: updated[0]?.views ?? null };
    }),

  getViews: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: and(eq(posts.slug, input.slug), eq(posts.published, true)),
        columns: { views: true },
      });
      return { views: post?.views ?? null };
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().min(1).max(100).optional().default(10),
        onlyPublished: z.boolean().optional().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query, limit, onlyPublished } = input;

      const whereConditions = [
        like(posts.title, `%${query}%`),
        like(posts.content, `%${query}%`),
        like(posts.summary, `%${query}%`),
        like(posts.tags, `%${query}%`),
      ];

      if (onlyPublished) {
        whereConditions.push(eq(posts.published, true));
      }

      const results = await ctx.db.query.posts.findMany({
        where: sql`(${whereConditions.reduce((acc, condition) => sql`${acc} OR ${condition}`)})`,
        limit,
        with: {
          author: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      return results;
    }),
});
