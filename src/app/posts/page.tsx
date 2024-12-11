import Link from "next/link";
import { formatDate, getBlogPosts } from "@/app/lib/posts";

export const metadata = {
  title: "Posts",
  description: "Philip Wallis blog posts",
};

export default function Posts() {
  const allPosts = getBlogPosts();

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
              <div className="flex w-full flex-col items-start justify-between space-y-1 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
                <p className="tracking-tight text-white">
                  {post.metadata.title}
                </p>
                <p className="text-sm tabular-nums text-neutral-400">
                  {formatDate(post.metadata.publishedAt, false)}
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
