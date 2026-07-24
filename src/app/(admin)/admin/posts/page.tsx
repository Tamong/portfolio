"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Eye, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type StatusFilter = "all" | "published" | "draft";

export default function AdminPosts() {
  const router = useRouter();
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const {
    data: postsData,
    isLoading,
    refetch,
  } = api.post.getAll.useQuery({ onlyPublished: false });

  const deleteMutation = api.post.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      void refetch();
    },
    onError: (error) => toast.error(error.message || "Failed to delete post"),
  });

  const posts = useMemo(() => {
    const items = postsData?.items ?? [];
    const q = query.trim().toLowerCase();
    return items.filter((post) => {
      if (status === "published" && !post.published) return false;
      if (status === "draft" && post.published) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        (post.tags ?? "").toLowerCase().includes(q)
      );
    });
  }, [postsData, query, status]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Button onClick={() => router.push("/admin/editor")}>
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, slug, tags…"
            className="w-64 pl-8"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "published", "draft"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? "secondary" : "ghost"}
              onClick={() => setStatus(s)}
              className="capitalize"
            >
              {s}
            </Button>
          ))}
        </div>
        <span className="text-muted-foreground ml-auto text-sm">
          {posts.length} post{posts.length === 1 ? "" : "s"}
        </span>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground flex h-40 items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-36">Published</TableHead>
                <TableHead className="w-36">Updated</TableHead>
                <TableHead className="w-20 text-right">Views</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow
                  key={post.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/editor?slug=${post.slug}`)}
                >
                  <TableCell>
                    <div className="font-medium">{post.title}</div>
                    <div className="text-muted-foreground text-xs">
                      /{post.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.published ? (
                      <span className="inline-flex items-center rounded-full bg-green-600/15 px-2 py-0.5 text-xs font-medium text-green-500">
                        Published
                      </span>
                    ) : (
                      <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                        Draft
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {post.updatedAt ? formatDate(post.updatedAt) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right text-sm tabular-nums">
                    {post.views.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end gap-1">
                      {post.published && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="View"
                          onClick={() => router.push(`/posts/${post.slug}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Edit"
                        onClick={() =>
                          router.push(`/admin/editor?slug=${post.slug}`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog
                        open={postToDelete === post.id}
                        onOpenChange={(open) => !open && setPostToDelete(null)}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive h-8 w-8 p-0"
                            title="Delete"
                            onClick={() => setPostToDelete(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete post?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently deletes &quot;{post.title}
                              &quot;. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/80"
                              onClick={() => {
                                deleteMutation.mutate({ id: post.id });
                                setPostToDelete(null);
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {posts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center">
                    <span className="text-muted-foreground">
                      {query || status !== "all"
                        ? "No posts match the filter."
                        : "No posts yet. Create your first post!"}
                    </span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
