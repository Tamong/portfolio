import Link from "next/link";
import { getBlogPosts } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Posts",
  description: "Philip Wallis blog posts",
};

export default async function Posts() {
  const allPosts = await getBlogPosts();

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-medium tracking-tight">Posts</h1>
      <div>
        {allPosts
          .sort((a, b) => {
            if (
              new Date(a.metadata.publishedAt) >
              new Date(b.metadata.publishedAt)
            ) {
              return -1;
            }
            return 1;
          })
          .map((post) => (
            <Link
              key={post.slug}
              className="mb-4 flex flex-col space-y-1 transition-opacity duration-200 hover:opacity-80"
              href={`/posts/${post.slug}`}
              prefetch={true}
            >
              <div className="flex w-full flex-col items-start justify-between space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                <p className="tracking-tight text-white">
                  {post.metadata.title}
                </p>
                <p className="text-sm text-neutral-400 tabular-nums">
                  {formatDate(post.metadata.publishedAt)}
                </p>
              </div>
              <div>
                <p className="max-w-md text-xs text-neutral-300">
                  {post.metadata.summary}
                </p>
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
}
