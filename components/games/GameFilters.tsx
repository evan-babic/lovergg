import Form from "next/form";
import FilterMenu, { type FilterOption } from "@/components/games/FilterMenu";
import { MONTHS, SORTS, buildBrowseHref, type BrowseState } from "@/lib/browse";
import type { NamedOption, PlatformOption } from "@/lib/igdb";

export default function GameFilters({
  state,
  genres,
  platforms,
  maxYear,
}: {
  state: BrowseState;
  genres: NamedOption[];
  platforms: PlatformOption[];
  maxYear: number;
}) {
  const genre = genres.find((g) => g.slug === state.genre);
  const platform = platforms.find((p) => p.slug === state.platform);

  const yearOptions: FilterOption[] = [
    {
      label: "Any year",
      href: buildBrowseHref(state, { year: null }),
      active: !state.year,
    },
  ];
  for (let y = maxYear; y >= 1980; y--) {
    yearOptions.push({
      label: String(y),
      href: buildBrowseHref(state, { year: y }),
      active: state.year === y,
    });
  }

  const monthOptions: FilterOption[] = [
    {
      label: "Any month",
      href: buildBrowseHref(state, { month: null }),
      active: !state.month,
    },
    ...MONTHS.map((name, i) => ({
      label: name,
      href: buildBrowseHref(state, { month: i + 1 }),
      active: state.month === i + 1,
    })),
  ];

  const genreOptions: FilterOption[] = [
    {
      label: "Any genre",
      href: buildBrowseHref(state, { genre: null }),
      active: !genre,
    },
    ...genres.map((g) => ({
      label: g.name,
      href: buildBrowseHref(state, { genre: g.slug }),
      active: g.slug === state.genre,
    })),
  ];

  const platformOptions: FilterOption[] = [
    {
      label: "Any platform",
      href: buildBrowseHref(state, { platform: null }),
      active: !platform,
    },
    ...platforms.map((p) => ({
      label: p.label,
      href: buildBrowseHref(state, { platform: p.slug }),
      active: p.slug === state.platform,
    })),
  ];
  if (platform) {
    platformOptions.push({
      label: `${state.exclusive ? "✓ " : ""}Only on ${platform.label}`,
      href: buildBrowseHref(state, {
        exclusive: state.exclusive ? null : true,
      }),
    });
  }

  const sortOptions: FilterOption[] = Object.entries(SORTS).map(
    ([key, label]) => ({
      label,
      href: buildBrowseHref(state, { sort: key }),
      active: (state.sort ?? "popular") === key,
    }),
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 pt-10">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Browse by
        </span>
        <div className="flex flex-wrap items-center divide-x divide-zinc-800 rounded-md ring-1 ring-zinc-800">
          <FilterMenu
            text={state.year ? String(state.year) : "Year"}
            options={yearOptions}
            highlighted={Boolean(state.year)}
          />
          <FilterMenu
            text={state.month ? MONTHS[state.month - 1] : "Month"}
            options={monthOptions}
            disabled={!state.year}
            highlighted={Boolean(state.month)}
          />
          <FilterMenu
            text={genre?.name ?? "Genre"}
            options={genreOptions}
            highlighted={Boolean(genre)}
          />
          <FilterMenu
            text={
              platform
                ? `${platform.label}${state.exclusive ? " only" : ""}`
                : "Platform"
            }
            options={platformOptions}
            highlighted={Boolean(platform)}
          />
          <FilterMenu
            text={SORTS[state.sort ?? "popular"]}
            options={sortOptions}
            highlighted={Boolean(state.sort)}
          />
        </div>
      </div>

      {/* A plain GET form: it keeps the current filters and adds ?q=... */}
      <Form action="/games" className="flex items-center gap-3">
        <label
          htmlFor="game-search"
          className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
        >
          Find a game
        </label>
        {state.year && <input type="hidden" name="year" value={state.year} />}
        {state.month && (
          <input type="hidden" name="month" value={state.month} />
        )}
        {state.genre && (
          <input type="hidden" name="genre" value={state.genre} />
        )}
        {state.platform && (
          <input type="hidden" name="platform" value={state.platform} />
        )}
        {state.exclusive && <input type="hidden" name="exclusive" value="1" />}
        {state.sort && <input type="hidden" name="sort" value={state.sort} />}
        <input
          key={state.q ?? ""}
          id="game-search"
          name="q"
          type="search"
          defaultValue={state.q}
          className="w-56 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-white outline-none ring-1 ring-zinc-700 focus:ring-2 focus:ring-indigo-500"
        />
      </Form>
    </div>
  );
}
