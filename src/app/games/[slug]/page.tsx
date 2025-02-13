import { Suspense } from "react";
import { notFound } from "next/navigation";
import { games, type GameSlug } from "@/app/lib/games";

interface GamePageProps {
  params: {
    slug: GameSlug;
  };
}

export function generateStaticParams() {
  return Object.keys(games).map((slug) => ({
    slug,
  }));
}

export default function Games({ params: { slug } }: GamePageProps) {
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
