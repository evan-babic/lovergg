// For detailed game view, uses [slug] from URL

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameBySlug } from "@/lib/igdb";

type Params = Promise<{ slug: string }>;

export default function GamePage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-6 py-12 text-zinc-500">
          Loading...
        </div>
      }
    >
      <GameDetails params={params} />
    </Suspense>
  );
}

async function GameDetails({ params }: { params: Params }) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) notFound();

  return (
    // Backdrop poster at top
    <article>
      {game.backdropUrl && (
        <div className="relative h-72 w-full overflow-hidden md:h-96">
          <Image
            src={game.backdropUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>
      )}

      <div
        className={`relative mx-auto max-w-5xl px-6 pb-12 ${game.backdropUrl ? "-mt-40" : "mt-12"}`}
      >
        <div className={"flex flex-col gap-8 md:flex-row"}>
          {/* Poster */}
          <div className="w-48 shrink-0 md:w-60">
            <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-zinc-800 ring-1 ring-zinc-700">
              {game.coverUrl ? (
                <Image
                  src={game.coverUrl}
                  alt={`${game.title} cover`}
                  fill
                  sizes="240px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-3 text-center font-bold">
                  {game.title}
                </div>
              )}
            </div>
          </div>

          {/* Main Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {game.title}
              {game.year && (
                <span className="ml-3 text-xl font-normal text-zinc-500">
                  {game.year}
                </span>
              )}
            </h1>

            {game.developers.length > 0 && (
              <p className="mt-1 text-sm text-zinc-400">
                Developed by {game.developers.join(", ")}
              </p>
            )}

            {game.summary && (
              <p className="mt-6 max-w-2xl leading-relaxed text-zinc-300">
                {game.summary}
              </p>
            )}

            <dl className="mt-8 space-y-5 text-sm">
              {game.releaseDate && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Released
                  </dt>
                  <dd className="mt-2 text-zinc-300">{game.releaseDate}</dd>
                </div>
              )}
              <MetaRow label="Genres" items={game.genres} />
              <MetaRow label="Platforms" items={game.platforms} />
              <MetaRow label="Publishers" items={game.publishers} />
            </dl>
          </div>

          {/* Sidebar */}
          <aside className="w-full shrink-0 md:w-56">
            <div className="rounded-lg bg-zinc-900 p-4 ring-1 ring-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                IGDB rating
              </p>
              {game.rating !== undefined ? (
                <>
                  <p className="mt-1 text-3xl font-bold">
                    ★ {game.rating.toFixed(1)}
                    <span className="text-base font-normal text-zinc-500">
                      {" "}
                      / 5
                    </span>
                  </p>
                  {game.ratingCount && (
                    <p className="text-xs text-zinc-500">
                      {game.ratingCount} ratings
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-zinc-500">
                  Not enough ratings yet
                </p>
              )}
            </div>

            <div className="mt-4 rounded-lg bg-zinc-900 p-4 text-sm ring-1 ring-zinc-800">
              <p className="text-zinc-300">Log, rate, or review this game.</p>
              <Link
                href="/login"
                className="mt-3 block rounded-lg bg-indigo-500 px-4 py-2 text-center font-medium text-white hover:bg-indigo-400"
              >
                Sign in to log
              </Link>
            </div>

            {game.igdbUrl && (
              <a
                href={game.igdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-xs text-zinc-500 hover:text-white"
              >
                View on IGDB ↗
              </a>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
}

function MetaRow({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </dt>
      <dd className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-md bg-zinc-800 px-2.5 py-1 text-zinc-300"
          >
            {item}
          </span>
        ))}
      </dd>
    </div>
  );
}
