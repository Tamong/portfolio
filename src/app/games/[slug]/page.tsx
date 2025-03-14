import { Suspense } from "react";
import { notFound } from "next/navigation";
import { games, type GameSlug } from "@/lib/games";
import type { Metadata } from "next";
import { metaData } from "@/config";

type Props = {
  params: Promise<{ slug: GameSlug }>;
};

// Update generateMetadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!(slug in games)) {
    notFound();
  }

  const title = games[slug].title;

  const ogImage = `${metaData.baseUrl}images/games/${slug}.png`;

  return {
    title,
    openGraph: {
      title,
      url: `${metaData.baseUrl}/games/${slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [ogImage],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!(slug in games)) {
    notFound();
  }

  const Game = games[slug].component;

  return (
    <Suspense fallback={<div>Loading game...</div>}>
      <Game />
    </Suspense>
  );
}
