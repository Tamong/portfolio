import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomMDX } from "@/components/post/mdx";
import { formatDate, getBlogPosts } from "@/lib/posts";
import { metaData } from "@/config";

// Define interfaces
interface PostParams {
  slug: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Update generateStaticParams
export async function generateStaticParams(): Promise<PostParams[]> {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Update generateMetadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPosts().find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;

  const ogImage =
    image ??
    `${metaData.baseUrl}api/og?title=${encodeURIComponent(title)}&path=posts`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${metaData.baseUrl}/posts/${post.slug}`,
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

export default async function Blog({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPosts().find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${metaData.baseUrl}${post.metadata.image}`
              : `/api/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${metaData.baseUrl}/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: metaData.name,
            },
          }),
        }}
      />
      <h1 className="title mb-3 text-2xl font-medium tracking-tight">
        {post.metadata.title}
      </h1>
      <div className="mt-2 mb-8 flex items-center justify-between">
        <p className="text-sm">{formatDate(post.metadata.publishedAt)}</p>
      </div>
      <article className="text-stone-300">
        <CustomMDX source={post.content} />
      </article>
    </section>
  );
}
