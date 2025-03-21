import { z } from "zod";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { comments } from "@/server/db/schema";
import { and, eq, isNull, asc } from "drizzle-orm";

export const commentRouter = createTRPCRouter({
  // Get comments for a post
  getByPostSlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      // First get top-level comments (no parentId)
      const topLevelComments = await ctx.db.query.comments.findMany({
        where: and(
          eq(comments.postSlug, input.slug),
          isNull(comments.parentId),
        ),
        orderBy: [asc(comments.createdAt)],
        with: {
          user: true,
        },
      });

      // For each comment, get its replies
      const commentsWithReplies = await Promise.all(
        topLevelComments.map(async (comment) => {
          const replies = await ctx.db.query.comments.findMany({
            where: eq(comments.parentId, comment.id),
            orderBy: [asc(comments.createdAt)],
            with: {
              user: true,
            },
          });

          return {
            ...comment,
            replies,
          };
        }),
      );

      return commentsWithReplies;
    }),

  // Create a new comment
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        postSlug: z.string().min(1),
        parentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const commentId = nanoid();

      await ctx.db.insert(comments).values({
        id: commentId,
        content: input.content,
        postSlug: input.postSlug,
        userId: ctx.session.user.id,
        parentId: input.parentId ?? null,
      });

      return { success: true, id: commentId };
    }),

  // Delete a comment (soft delete now by setting isDeleted flag)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const commentToDelete = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, input.id),
      });

      if (!commentToDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      // Only allow the owner to delete
      if (commentToDelete.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized",
        });
      }

      // Update the comment to mark it as deleted instead of removing it
      await ctx.db
        .update(comments)
        .set({ isDeleted: true })
        .where(eq(comments.id, input.id));

      return { success: true };
    }),
});
