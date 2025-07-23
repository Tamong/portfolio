import Image from "next/image";
import Link from "next/link";
import { games } from "@/lib/games";

export const metadata = {
  title: "Games",
  description: "Philip Wallis games",
};

export default function Games() {
  const allGames = Object.entries(games).map(([slug, { title, image }]) => ({
    title,
    image,
    slug,
  }));

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-medium tracking-tight">Games</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {allGames.map((game) => (
          <Link
            key={game.slug}
            className="flex flex-col items-center justify-center space-y-1 transition-opacity duration-200 hover:opacity-80"
            href={`/games/${game.slug}`}
            prefetch={true}
          >
            <p className="text-xl tracking-tight">{game.title}</p>

            <Image
              className="rounded-lg"
              src={game.image}
              alt={game.title}
              width={600}
              height={400}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
