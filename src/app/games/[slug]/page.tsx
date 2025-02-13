import { Suspense } from "react";
import { notFound } from "next/navigation";
import { games, type GameSlug } from "@/app/lib/games";

type Props = {
  params: Promise<{ slug: GameSlug }>;
};

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
