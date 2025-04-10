"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Pencil, Trash2, Eye, Plus } from "lucide-react";
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

export default function AdminPosts() {
  const router = useRouter();
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const {
    data: postsData,
    isLoading,
    refetch,
  } = api.post.getAll.useQuery({
    onlyPublished: false,
  });

  const deleteMutation = api.post.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted successfully");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
    setPostToDelete(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Posts</h1>
        <Button
          onClick={() => router.push("/admin/editor")}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {postsData?.items.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  {post.published ? (
                    <div className="flex items-center justify-center rounded border border-green-600 bg-green-600 px-1 py-0.5 text-xs">
                      Published
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded border px-1 py-0.5 text-xs">
                      Draft
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {post.publishedAt
                    ? formatDate(post.publishedAt)
                    : "Not published"}
                </TableCell>
                <TableCell>
                  {post.updatedAt ? formatDate(post.updatedAt) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/posts/${post.slug}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
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
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setPostToDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the post &quot;{post.title}&quot;.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-700"
                            onClick={() => handleDelete(post.id)}
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
            {postsData?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  No posts found. Create your first post!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
