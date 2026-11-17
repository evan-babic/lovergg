import GameCard from "@/components/GameCard";
import { getPopularGames } from "@/lib/igdb";

export default async function GamesPage() {
  const games = await getPopularGames();

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-6 border-b border-zinc-800 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Popular games
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
