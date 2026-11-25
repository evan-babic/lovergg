"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";

export type FilterOption = { label: string; href: string; active?: boolean };

export default function FilterMenu({
  text,
  options,
  disabled = false,
  highlighted = false,
}: {
  text: string;
  options: FilterOption[];
  disabled?: boolean;
  highlighted?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useLayoutEffect(() => () => setOpen(false), []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:text-white disabled:cursor-not-allowed disabled:opacity-40 ${
          highlighted ? "text-white" : "text-zinc-400"
        }`}
      >
        {text}
        <span aria-hidden="true">▾</span>
      </button>

      {open && (
        <ul className="absolute left-0 top-full z-20 mt-1 max-h-72 min-w-44 overflow-y-auto rounded-md bg-zinc-900 py-1 text-sm shadow-lg ring-1 ring-zinc-700">
          {options.map((option) => (
            <li key={`${option.label}-${option.href}`}>
              <Link
                href={option.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-1.5 hover:bg-zinc-800 ${
                  option.active ? "font-semibold text-white" : "text-zinc-300"
                }`}
              >
                {option.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
