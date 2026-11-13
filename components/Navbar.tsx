// Basic navbar code emulating Letterboxd style

import Link from "next/link";

const links = [
  { href: "/games", label: "Games" },
  { href: "/lists", label: "Lists" },
  { href: "/members", label: "Members" },
];

export default function Navbar() {
  return (
    <header>
      <nav className="mx-auto flex max-w-5xl items-center gap-8 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tight text-white mr-8">
            lover.gg
          </span>
        </Link>

        <ul className="flex items-center gap-5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <li>
            <Link href="/login" className="hover:text-white">
              Sign in
            </Link>
          </li>
          <li>
            <Link href="/signup" className="hover:text-white">
              Create account
            </Link>
          </li>
          {links.map((link) => (
            <li key={link.href} className="hidden md:block">
              <Link href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <form action="/games" className="ml-auto hidden sm:block">
          <div className="relative">
            <input
              type="search"
              name="q"
              aria-label="Search games"
              className="w-40 rounded-full bg-zinc-700 py-1.5 pl-4 pr-9 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </div>
        </form>
      </nav>
    </header>
  );
}
