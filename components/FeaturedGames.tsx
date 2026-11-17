import Link from "next/link";
import GameCard from "@/components/GameCard";
import { getPopularGames } from "@/lib/igdb";

export default async function FeaturedGames() {
  const games = (await getPopularGames()).slice(0, 4);

  return (
    <section className="mx-auto max-w-5xl px-6">
      <div className="mb-4 flex items-baseline justify-between border-b border-zinc-800 pb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Trending now
        </h2>
        <a
          href="/games"
          className="text-xs uppercase tracking-wider text-zinc-500 hover:text-white"
        >
          More
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
