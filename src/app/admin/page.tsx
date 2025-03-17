"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { FileText, Edit, BarChart } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: postsData } = api.post.getAll.useQuery({
    onlyPublished: false,
  });

  const totalPosts = postsData?.items.length ?? 0;
  const publishedPosts =
    postsData?.items.filter((post) => post.published).length ?? 0;
  const draftPosts = totalPosts - publishedPosts;

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              All blog posts in the database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <BarChart className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedPosts}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Posts visible to readers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftPosts}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Unpublished content
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <Button
          onClick={() => router.push("/admin/posts")}
          size="lg"
          className="flex items-center"
        >
          <FileText className="mr-2 h-4 w-4" />
          Manage Posts
        </Button>

        <Button
          onClick={() => router.push("/admin/editor")}
          variant="outline"
          size="lg"
          className="flex items-center"
        >
          <Edit className="mr-2 h-4 w-4" />
          Create New Post
        </Button>
      </div>
    </div>
  );
}
