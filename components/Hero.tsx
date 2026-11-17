import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-24 pb-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Track the games you play. Share the ones you love.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
        Log, rate, and review games, build lists, and follow friends.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-indigo-500 px-6 py-3 font-medium text-white hover:bg-indigo-400"
        >
          Get started
        </Link>
        <Link
          href="/games"
          className="rounded-lg border border-zinc-700 px-6 py-3 text-zinc-200 hover:border-zinc-500"
        >
          Browse games
        </Link>
      </div>
    </section>
  );
}
