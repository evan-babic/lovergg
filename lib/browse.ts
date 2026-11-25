export const SORTS = {
  popular: "Popular",
  wanted: "Most wanted",
  played: "Most played",
  rating: "Highest rated",
} as const;

export type SortKey = keyof typeof SORTS;

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type BrowseState = {
  q?: string;
  year?: number;
  month?: number;
  genre?: string;
  platform?: string;
  exclusive: boolean;
  sort?: SortKey;
  page: number;
};

type Raw = Record<string, string | string[] | undefined>;
type Override = string | number | boolean | null | undefined;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function toInt(value: string | undefined, min: number, max: number) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
}

// Everything in the URL is untrusted input, so validate it all.
export function parseBrowseState(raw: Raw, maxYear: number): BrowseState {
  const year = toInt(first(raw.year), 1970, maxYear);
  const sort = first(raw.sort);
  return {
    q: first(raw.q)?.trim().slice(0, 100) || undefined,
    year,
    month: year ? toInt(first(raw.month), 1, 12) : undefined,
    genre: first(raw.genre),
    platform: first(raw.platform),
    exclusive: first(raw.exclusive) === "1",
    sort: sort && Object.hasOwn(SORTS, sort) ? (sort as SortKey) : undefined,
    page: toInt(first(raw.page), 1, 50) ?? 1,
  };
}

export function buildBrowseHref(
  state: BrowseState,
  overrides: Partial<
    Record<
      | "q"
      | "year"
      | "month"
      | "genre"
      | "platform"
      | "exclusive"
      | "sort"
      | "page",
      Override
    >
  > = {},
) {
  const merged: Record<string, Override> = {
    q: state.q,
    year: state.year,
    month: state.month,
    genre: state.genre,
    platform: state.platform,
    exclusive: state.exclusive,
    sort: state.sort,
    ...overrides,
  };
  if (!merged.year) merged.month = null; // month only makes sense with a year
  if (!merged.platform) merged.exclusive = null; // "only on" needs a platform

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (
      value === undefined ||
      value === null ||
      value === false ||
      value === ""
    )
      continue;
    params.set(key, value === true ? "1" : String(value));
  }
  const query = params.toString();
  return query ? `/games?${query}` : "/games";
}

export function isBrowsing(state: BrowseState) {
  return Boolean(state.q || state.year || state.genre || state.platform || state.sort);
}