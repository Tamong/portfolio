"use client";

import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { X } from "lucide-react";
// Removed unused Link import
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Session } from "next-auth";

// Remove the custom Session interface and use NextAuth's Session type

interface CommentsProps {
  slug: string;
  session: Session | null;
  id?: string;
}

export default function Comments({
  slug,
  session,
  id = "comments",
}: CommentsProps) {
  const [comment, setComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const commentsQuery = api.comment.getByPostSlug.useQuery({ slug });

  const createCommentMutation = api.comment.create.useMutation({
    onSuccess: () => {
      setComment("");
      void commentsQuery.refetch();
      toast.success("Comment posted successfully!");
    },
  });

  const deleteCommentMutation = api.comment.delete.useMutation({
    onSuccess: () => {
      void commentsQuery.refetch();
      toast.success("Comment deleted successfully!");
    },
  });

  const handleSubmitComment = () => {
    if (!comment.trim()) return;

    createCommentMutation.mutate({
      content: comment,
      postSlug: slug,
    });
  };

  const handleSubmitReply = () => {
    if (!replyContent.trim() || !replyToId) return;

    createCommentMutation.mutate({
      content: replyContent,
      postSlug: slug,
      parentId: replyToId,
    });

    // Reset reply state
    setReplyToId(null);
    setReplyContent("");
  };

  const handleOpenDeleteDialog = (id: string) => {
    setCommentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (commentToDelete) {
      deleteCommentMutation.mutate({ id: commentToDelete });
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const isLoading = commentsQuery.isLoading;
  const isAuthenticated = !!session?.user;

  // Function to safely format dates
  const safeFormatDate = (dateInput: string | Date | null | undefined) => {
    if (!dateInput) return "";
    return formatDate(dateInput);
  };

  // Add better image error handling
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn("Failed to load profile image");
    e.currentTarget.style.display = "none";
  };

  return (
    <div id={id} className="comments-section w-full">
      <h2 className="mb-4 text-xl font-bold">Comments</h2>

      {/* Comment input for authenticated users */}
      {isAuthenticated ? (
        <div className="mb-6">
          <div className="flex flex-col">
            <Button
              variant="link"
              onClick={() => signOut()}
              className="rounded px-4 py-2 text-blue-500"
            >
              Sign Out
            </Button>
            <div className="flex gap-4">
              <Avatar className="ring-primary/20 ring-offset-background h-10 w-10 ring-2 ring-offset-2">
                {session?.user.image ? (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name ?? "User"}
                    onError={handleImageError}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {session?.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-2 min-h-[80px] w-full"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={
                      !comment.trim() || createCommentMutation.isPending
                    }
                  >
                    {createCommentMutation.isPending
                      ? "Posting..."
                      : "Post Comment"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="mb-2 text-center">
            <Button
              variant="link"
              onClick={() => signIn("google")}
              className="rounded px-4 py-2 text-blue-500"
            >
              Sign in to comment
            </Button>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-2 h-[80px] w-full" />
              <div className="flex justify-end">
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Separator className="my-6" />

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="mb-2 h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : commentsQuery.data?.length === 0 ? (
        <p className="py-6 text-center text-gray-500">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-6">
          {commentsQuery.data?.map((comment) => (
            <div key={comment.id} className="comment-thread">
              {/* Main comment */}
              <div className="flex gap-4">
                <Avatar className="ring-primary/10 ring-offset-background h-10 w-10 ring-1 ring-offset-1">
                  {comment.user.image ? (
                    <AvatarImage
                      src={comment.user.image}
                      alt={comment.user.name ?? "User"}
                      onError={handleImageError}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {comment.user.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.user.name}</span>
                      <span className="text-xs text-gray-500">
                        {safeFormatDate(comment.createdAt)}
                      </span>
                    </div>
                    {session?.user?.id === comment.userId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500"
                        onClick={() => handleOpenDeleteDialog(comment.id)}
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                  <p className="mt-1">{comment.content}</p>
                  {isAuthenticated && (
                    <Button
                      variant={"ghost"}
                      size="sm"
                      className={`mt-1 h-6 text-xs ${
                        replyToId === comment.id
                          ? "text-red-500 hover:text-red-600"
                          : "text-blue-500 hover:text-blue-600"
                      }`}
                      onClick={() =>
                        setReplyToId(
                          replyToId === comment.id ? null : comment.id,
                        )
                      }
                    >
                      {replyToId === comment.id ? "Cancel" : "Reply"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Reply input */}
              {replyToId === comment.id && (
                <div className="mt-3 ml-14">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="mb-2"
                  />
                  <Button
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={
                      !replyContent.trim() || createCommentMutation.isPending
                    }
                  >
                    {createCommentMutation.isPending
                      ? "Posting..."
                      : "Post Reply"}
                  </Button>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-14 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-4">
                      <Avatar className="ring-primary/10 ring-offset-background h-8 w-8 ring-1 ring-offset-1">
                        {reply.user.image ? (
                          <AvatarImage
                            src={reply.user.image}
                            alt={reply.user.name ?? "User"}
                            onError={handleImageError}
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {reply.user.name?.charAt(0).toUpperCase() ?? "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {reply.user.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {safeFormatDate(reply.createdAt)}
                            </span>
                          </div>
                          {session?.user?.id === reply.userId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-500"
                              onClick={() => handleOpenDeleteDialog(reply.id)}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                        <p className="mt-1">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
