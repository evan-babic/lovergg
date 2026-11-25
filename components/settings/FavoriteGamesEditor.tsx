"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import type { Game } from "@/lib/types";
import {
  searchFavoriteGames,
  updateFavoriteGames,
} from "@/app/settings/actions";

export default function FavoriteGamesEditor({
  initialFavorites,
}: {
  initialFavorites: Game[];
}) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Game[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [searchPending, startSearch] = useTransition();
  const [savePending, startSave] = useTransition();

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSearchMessage(null);
    startSearch(async () => {
      const games = await searchFavoriteGames(query);
      setResults(games);
      if (games.length === 0) setSearchMessage("No games found. Try another search.");
    });
  }

  function addFavorite(game: Game) {
    if (
      favorites.length >= 4 ||
      favorites.some((favorite) => favorite.id === game.id)
    ) {
      return;
    }
    setFavorites([...favorites, game]);
    setResults([]);
    setQuery("");
    setSearchMessage(null);
  }

  function removeFavorite(gameId: number) {
    setFavorites(favorites.filter((game) => game.id !== gameId));
  }

  function saveFavorites() {
    setMessage(null);
    startSave(async () => {
      const result = await updateFavoriteGames(
        favorites.map((game) => game.id),
      );
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Favorite games saved.");
    });
  }

  return (
    <section className="mx-auto max-w-xl">
      <h2 className="border-b border-zinc-800 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Favorite games
      </h2>
      <p className="mt-3 text-sm text-zinc-400">
        Choose up to four games to feature on your profile.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((slot) => {
          const game = favorites[slot];
          return (
            <div
              key={slot}
              className="relative min-h-20 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900"
            >
              {game ? (
                <div className="flex items-center gap-3 p-3">
                  {game.coverUrl && (
                    <Image
                      src={game.coverUrl}
                      alt=""
                      width={48}
                      height={64}
                      className="h-16 w-12 rounded object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-zinc-100">
                      {game.title}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeFavorite(game.id)}
                      className="mt-2 text-xs text-zinc-500 hover:text-white"
                      aria-label={`Remove ${game.title}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-20 items-center justify-center text-xs text-zinc-600">
                  Favorite {slot + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {favorites.length < 4 && (
        <form onSubmit={handleSearch} className="mt-5 flex gap-2">
          <label htmlFor="favorite-game-search" className="sr-only">
            Search games
          </label>
          <input
            id="favorite-game-search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setResults([]);
              setSearchMessage(null);
            }}
            placeholder="Search for a game"
            className="min-w-0 flex-1 rounded-md bg-zinc-800 px-3 py-2 text-sm text-white outline-none ring-1 ring-zinc-700 focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={searchPending || query.trim().length < 2}
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500 disabled:opacity-50"
          >
            {searchPending ? "Searching…" : "Search"}
          </button>
        </form>
      )}

      {results.length > 0 && (
        <ul className="mt-3 divide-y divide-zinc-800 rounded-lg border border-zinc-800">
          {results.map((game) => (
            <li key={game.id}>
              <button
                type="button"
                onClick={() => addFavorite(game)}
                className="flex w-full items-center gap-3 p-3 text-left hover:bg-zinc-900"
              >
                {game.coverUrl && (
                  <Image
                    src={game.coverUrl}
                    alt=""
                    width={36}
                    height={48}
                    className="h-12 w-9 rounded object-cover"
                  />
                )}
                <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">
                  {game.title}
                </span>
                <span className="text-xs text-indigo-300">Add</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {searchMessage && (
        <p role="status" className="mt-3 text-sm text-zinc-500">
          {searchMessage}
        </p>
      )}

      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={saveFavorites}
          disabled={savePending}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
        >
          {savePending ? "Saving…" : "Save favorites"}
        </button>
        {message && (
          <p
            role={message.includes("saved") ? "status" : "alert"}
            className="text-sm text-zinc-400"
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
