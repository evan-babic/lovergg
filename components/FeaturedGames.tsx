import GameCard from "@/components/GameCard";
import { trendingGames } from "@/lib/mock-games";

export default function FeaturedGames() {
  return (
    <section className="mx-auto max-w-5xl px-6">
      <div className="mb-4 flex items-baseline justify-between border-b border-zinc-800 pb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Trending this week
        </h2>
        <a
          href="/games"
          className="text-xs uppercase tracking-wider text-zinc-500 hover:text-white"
        >
          More
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {trendingGames.slice(0, 5).map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
