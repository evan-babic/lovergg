import GameCard from "@/components/GameCard";
import { getPopularGames, searchGames } from "@/lib/igdb";
import { Suspense } from "react";

type SearchParams = Promise<{ q?: string | string[] }>;

{
  /* Shows games page, filtered by search (if any), else most popular*/
}
export default function GamesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
        <GameResults searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

{
  /* React component containing all games returned by igdb */
}
async function GameResults({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  const games = query ? await searchGames(query) : await getPopularGames();
  const heading = query ? `Results for "${query}` : "Popular games";

  return (
    <>
      <h1 className="mb-6 border-b border-zinc-800 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {heading}
      </h1>

      {games.length === 0 ? (
        <p className="text-zinc-400">
          No games found for &quot${query}&quot. Try a different spelling or
          fewer words.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </>
  );
}
