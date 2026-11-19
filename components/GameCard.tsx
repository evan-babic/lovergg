// Gamecard component

import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/lib/types";

{
  /* GameCard component, displaying basic information about games */
}
export default function GameCard({ game }: { game: Game }) {
  const meta = [
    game.year,
    game.rating !== undefined ? `★ ${game.rating.toFixed(1)}` : null,
  ]
    .filter(Boolean)
    .join(" . ");

  return (
    <Link href={`/games/${game.slug}`} className="group block">
      <div
        className={`relative aspect-[3/4] overflow-hidden rounded-lg ring-1 ring-zinc-800 transition group-hover:ring-indigo-500 ${game.color ?? "bg-zinc-800"}`}
      >
        {game.coverUrl ? (
          <Image
            src={game.coverUrl}
            alt={`${game.title} cover`}
            fill
            sizes="(min-width: 768px) 20vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-lg font-bold text-white/90">
            {game.title}
          </div>
        )}
      </div>

      <div className="mt-2">
        <h3 className="truncate text-sm font-medium text-zinc-100 group-hover:text-white">
          {game.title}
        </h3>
        <p className="text-xs text-zinc-500">{meta}</p>
      </div>
    </Link>
  );
}
