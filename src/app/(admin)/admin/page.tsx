"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { formatDate } from "@/lib/utils";
import { BarChart, Edit, FileText, Pencil, Plus } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: postsData, isLoading } = api.post.getAll.useQuery({
    onlyPublished: false,
  });

  const posts = postsData?.items ?? [];
  const totalPosts = posts.length;
  const publishedPosts = posts.filter((post) => post.published).length;
  const draftPosts = totalPosts - publishedPosts;
  const recent = [...posts]
    .sort(
      (a, b) =>
        (b.updatedAt ?? b.publishedAt ?? new Date(0)).getTime() -
        (a.updatedAt ?? a.publishedAt ?? new Date(0)).getTime(),
    )
    .slice(0, 5);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => router.push("/admin/editor")}>
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Posts"
          value={isLoading ? "…" : totalPosts}
          hint="All blog posts in the database"
          icon={<FileText className="text-muted-foreground h-4 w-4" />}
        />
        <StatCard
          title="Published"
          value={isLoading ? "…" : publishedPosts}
          hint="Posts visible to readers"
          icon={<BarChart className="text-muted-foreground h-4 w-4" />}
        />
        <StatCard
          title="Drafts"
          value={isLoading ? "…" : draftPosts}
          hint="Unpublished content"
          icon={<Edit className="text-muted-foreground h-4 w-4" />}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recently updated</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recent.map((post) => (
            <Link
              key={post.id}
              href={`/admin/editor?slug=${post.slug}`}
              className="hover:bg-accent/50 flex items-center justify-between border-t px-6 py-3 transition-colors"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{post.title}</p>
                <p className="text-muted-foreground text-xs">
                  {post.published ? "Published" : "Draft"} ·{" "}
                  {post.updatedAt
                    ? `updated ${formatDate(post.updatedAt)}`
                    : post.publishedAt
                      ? formatDate(post.publishedAt)
                      : "no date"}
                </p>
              </div>
              <Pencil className="text-muted-foreground h-4 w-4 shrink-0" />
            </Link>
          ))}
          {!isLoading && recent.length === 0 && (
            <p className="text-muted-foreground border-t px-6 py-6 text-sm">
              No posts yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: React.ReactNode;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
      </CardContent>
    </Card>
  );
}
