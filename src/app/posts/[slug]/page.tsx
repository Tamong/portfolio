import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CustomMDX } from "@/components/post/mdx";
import { getBlogPostBySlug } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { metaData } from "@/config";

import { Separator } from "@/components/ui/separator";

import { auth } from "@/server/auth";
import Comments from "@/app/_components/comments";
import { HydrateClient } from "@/trpc/server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Update generateMetadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { title, publishedAt, summary: description, image } = post;

  const sanitizedTitle = title.replace(/[^a-zA-Z0-9 ]/g, " ");

  const ogImage = `${metaData.baseUrl}api/og?title=${encodeURIComponent(sanitizedTitle)}&path=posts`; // image; <-- featured image in db

  return {
    title,
    description,
    openGraph: {
      title,
      description: description ?? undefined,
      type: "article",
      publishedTime: publishedAt?.toISOString(),
      url: `${metaData.baseUrl}posts/${post.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description ?? undefined,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const session = await auth();
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto px-4 py-8">
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
              description: post.summary,
              image: post.image
                ? `${metaData.baseUrl}${post.image}`
                : `/api/og?title=${encodeURIComponent(post.title)}`,
              url: `${metaData.baseUrl}/blog/${post.slug}`,
              author: {
                "@type": "Person",
                name: post.author?.name ?? metaData.name,
              },
            }),
          }}
        />
        <Suspense>
          <h1 className="title mb-3 text-2xl font-medium tracking-tight">
            {post.title}
          </h1>
          <div className="mt-2 mb-8 flex items-center justify-between">
            <p className="text-sm">
              {post.publishedAt ? formatDate(post.publishedAt) : "Unpublished"}
            </p>
          </div>
          <article>
            <CustomMDX source={post.content} />
          </article>
          <Separator className="my-8" />
        </Suspense>
      </section>
      <div className="mt-16">
        <Suspense
          fallback={
            <div className="text-muted-foreground text-sm">
              Loading comments...
            </div>
          }
        >
          <HydrateClient>
            <Comments slug={slug} session={session} />
          </HydrateClient>
        </Suspense>
      </div>
    </div>
  );
}
