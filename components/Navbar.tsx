// Basic navbar code

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-zinc-800">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          Gamelog
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/games" className="text-zinc-300 hover:text-white">
            Browse
          </Link>
          <Link href="/login" className="text-zinc-300 hover:text-white">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-400"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}
