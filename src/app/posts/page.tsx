import Link from "next/link";
import { getBlogPosts } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Posts",
  description: "Philip Wallis blog posts",
};

export const revalidate = 60;

export default async function Posts() {
  const allPosts = await getBlogPosts();

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-medium tracking-tight">Posts</h1>
      <div>
        {allPosts.map((post) => (
          <Link
            key={post.slug}
            className="mb-4 flex flex-col space-y-1 transition-opacity duration-200 hover:opacity-80"
            href={`/posts/${post.slug}`}
            prefetch={true}
          >
            <div className="flex w-full flex-col items-start justify-between space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
              <p className="max-w-128 tracking-tight text-white">
                {post.title}
              </p>
              <p className="text-sm text-neutral-400 tabular-nums">
                {formatDate(post.publishedAt ?? post.createdAt)}
              </p>
            </div>
            <div>
              <p className="max-w-md text-xs text-neutral-300">
                {post.summary}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
