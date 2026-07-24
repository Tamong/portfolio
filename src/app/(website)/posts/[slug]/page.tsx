import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomMDX } from "@/components/post/mdx";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { metaData } from "@/config";

import { Separator } from "@/components/ui/separator";

import CommentsSection from "@/app/_components/comments-section";
import ViewCounter from "@/app/_components/view-counter";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// The post body is fully static: pages are prerendered for all published
// posts and only regenerated when a post is saved in the admin (the tRPC
// mutations call revalidatePath). Views and comments are client islands.
export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { title, publishedAt, summary } = post;
  const description = summary ?? `Read ${title} on ${metaData.name}'s blog`;

  const sanitizedTitle = title.replace(/[^a-zA-Z0-9 ]/g, " ");

  const ogImage = `${metaData.baseUrl}api/og?title=${encodeURIComponent(sanitizedTitle)}&path=posts`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: publishedAt?.toISOString(),
      url: `${metaData.baseUrl}posts/${post.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const postDescription =
    post.summary ?? `Read ${post.title} on ${metaData.name}'s blog`;

  return (
    <div className="mx-auto py-8">
      <section>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              datePublished: post.publishedAt?.toISOString(),
              dateModified:
                post.updatedAt?.toISOString() ??
                post.publishedAt?.toISOString(),
              description: postDescription,
              image: post.image
                ? `${metaData.baseUrl}${post.image}`
                : `${metaData.baseUrl}api/og?title=${encodeURIComponent(post.title)}`,
              url: `${metaData.baseUrl}posts/${post.slug}`,
              author: {
                "@type": "Person",
                name: post.author?.name ?? metaData.name,
              },
            }),
          }}
        />
        <h1 className="title mb-3 text-2xl font-medium tracking-tight">
          {post.title}
        </h1>
        <div className="mt-2 mb-8 flex items-center justify-between">
          <p className="text-sm">
            {post.publishedAt ? formatDate(post.publishedAt) : "Unpublished"}
          </p>
          <ViewCounter slug={post.slug} />
        </div>
        <article>
          <CustomMDX source={post.content} />
        </article>
        <Separator className="my-8" />
      </section>
      <div className="mt-16">
        <CommentsSection slug={slug} />
      </div>
    </div>
  );
}
