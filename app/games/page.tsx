import { Suspense } from "react";
import Link from "next/link";
import FeaturedGames from "@/components/FeaturedGames";
import GameCard from "@/components/GameCard";
import GameFilters from "@/components/games/GameFilters";
import PopularReviews from "@/components/games/PopularReviews";
import { connection } from "next/server";
import {
  MONTHS,
  buildBrowseHref,
  isBrowsing,
  parseBrowseState,
  type BrowseState,
} from "@/lib/browse";
import {
  browseGames,
  getGenres,
  getPlatforms,
  type NamedOption,
  type PlatformOption,
} from "@/lib/igdb";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function GamesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-5xl px-6 py-12 text-zinc-500">Loading…</p>}>
      <GamesBrowser searchParams={searchParams} />
    </Suspense>
  );
}

async function GamesBrowser({ searchParams }: { searchParams: SearchParams }) {
  await connection(); // the current year below must be read at request time
  const raw = await searchParams;
  const maxYear = new Date().getFullYear() + 1;
  const state = parseBrowseState(raw, maxYear);

  const [genres, platforms] = await Promise.all([getGenres(), getPlatforms()]);
  const genre = genres.find((g) => g.slug === state.genre);
  const platform = platforms.find((p) => p.slug === state.platform);

  return (
    <>
      <GameFilters state={state} genres={genres} platforms={platforms} maxYear={maxYear} />

      {isBrowsing(state) ? (
        <Suspense
          fallback={<p className="mx-auto max-w-5xl px-6 py-10 text-zinc-500">Loading games…</p>}
        >
          <Results state={state} genre={genre} platform={platform} />
        </Suspense>
      ) : (
        <>
          <FeaturedGames title="Popular this week" moreHref="/games?sort=popular" />
          <PopularReviews />
        </>
      )}
    </>
  );
}

async function Results({
  state,
  genre,
  platform,
}: {
  state: BrowseState;
  genre?: NamedOption;
  platform?: PlatformOption;
}) {
  const { games, hasNext } = await browseGames({
    q: state.q,
    year: state.year,
    month: state.month,
    genreId: genre?.id,
    platformId: platform?.id,
    exclusive: state.exclusive && Boolean(platform),
    sort: state.sort ?? "popular",
    page: state.page,
  });

  const parts = [
    state.q && `“${state.q}”`,
    state.year && (state.month ? `${MONTHS[state.month - 1]} ${state.year}` : String(state.year)),
    genre?.name,
    platform && (state.exclusive ? `${platform.label} only` : platform.label),
  ].filter(Boolean);

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-4 flex items-baseline justify-between border-b border-zinc-800 pb-2">
        <h1 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {["Games", ...parts].join(" · ")}
        </h1>
        <Link
          href="/games"
          className="text-xs uppercase tracking-wider text-zinc-500 hover:text-white"
        >
          Clear
        </Link>
      </div>

      {games.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No games match these filters. Try removing one, or switch to “Highest rated”.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

      {(state.page > 1 || hasNext) && (
        <nav className="mt-8 flex items-center justify-between text-sm" aria-label="Pagination">
          {state.page > 1 ? (
            <Link
              href={buildBrowseHref(state, { page: state.page - 1 > 1 ? state.page - 1 : null })}
              className="text-zinc-300 hover:text-white"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {hasNext && (
            <Link
              href={buildBrowseHref(state, { page: state.page + 1 })}
              className="text-zinc-300 hover:text-white"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}