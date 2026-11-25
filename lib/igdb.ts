import "server-only";
import { cacheLife } from "next/cache";
import type { Game, GameDetail } from "@/lib/types";

const IGDB_URL = "https://api.igdb.com/v4";
const IMAGE_BASE = "https://images.igdb.com/igdb/image/upload";

type PopularityRow = { game_id: number; value: number };

type IgdbGame = {
  id: number;
  name: string;
  slug: string;
  first_release_date?: number; // in unix seconds
  total_rating?: number; // 0 to 100
  cover?: { image_id: string };
};

type IgdbGameDetail = IgdbGame & {
  summary?: string;
  total_rating_count?: number;
  url?: string;
  genres?: { name: string }[];
  platforms?: { name: string }[];
  involved_companies?: {
    developer: boolean;
    publisher: boolean;
    company: { name: string };
  }[];
  artworks?: { image_id: string }[];
  screenshots?: { image_id: string }[];
};

// Gets access token from Twitch using secrets
async function getAccessToken(): Promise<string> {
  const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = process.env; // fetches env variables

  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    // if either is missing, throw error
    throw new Error(
      "Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET in .env.local",
    );
  }

  const res = await fetch(
    // attempts to get access token from twitch
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" },
  );

  if (!res.ok) throw new Error(`Twitch token request failed: ${res.status}`); // throws error if unsuccessful
  const data = await res.json();
  return data.access_token as string; // returns access key if successful
}

// Queries IGDB for raw data
async function igdbQuery<T>(endpoint: string, body: string): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${IGDB_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  if (!res.ok)
    throw new Error(`IGDB ${endpoint} request failed. ${res.status}`);
  return res.json() as Promise<T>;
}

// Transforms raw IGDB data to my Game data structure
function toGame(g: IgdbGame): Game {
  return {
    id: g.id,
    slug: g.slug,
    title: g.name,
    year: g.first_release_date
      ? new Date(g.first_release_date * 1000).getUTCFullYear()
      : undefined,
    rating: g.total_rating !== undefined ? g.total_rating / 20 : undefined,
    coverUrl: g.cover
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover.image_id}.jpg`
      : undefined,
  };
}

// Function combining everything to get list of most popular games
export async function getPopularGames(): Promise<Game[]> {
  "use cache";
  cacheLife("days");

  // Which games are most visited on IGDB?
  const popular = await igdbQuery<PopularityRow[]>(
    "popularity_primitives",
    "fields game_id,value; where popularity_type = 1; sort value desc; limit 60;",
  );
  const ids = popular.map((p) => p.game_id);

  // Get names, covers, etc for each game
  const games = await igdbQuery<IgdbGame[]>(
    "games",
    `fields name,slug,first_release_date,total_rating,cover.image_id; where id = (${ids.join(",")}); limit 60;`,
  );

  // IGDB returns them in arbitrary order, so restore the popularity rankin
  return games
    .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
    .map(toGame)
    .filter((g) => g.coverUrl)
    .slice(0, 48);
}

// For detailed view of each game, queries for all information and returns in GameDetail structure to be displayed
export async function getGameBySlug(slug: string): Promise<GameDetail | null> {
  "use cache";
  cacheLife("days");

  // Slug comes from URL, so only allow safe characters before putting it into query string
  if (!/^[a-z0-9._-]+$/.test(slug)) return null;

  const results = await igdbQuery<IgdbGameDetail[]>(
    "games",
    `fields name,slug,summary,first_release_date,total_rating,total_rating_count,url,
      cover.image_id,genres.name,platforms.name,
      involved_companies.developer,involved_companies.publisher,involved_companies.company.name,
      artworks.image_id,screenshots.image_id;
     where slug = "${slug}"; limit 1;`,
  );

  const g = results[0];
  if (!g) return null;

  const companies = g.involved_companies ?? [];
  const backdropId = g.artworks?.[0]?.image_id ?? g.screenshots?.[0]?.image_id;

  return {
    ...toGame(g),
    coverUrl: g.cover
      ? `${IMAGE_BASE}/t_cover_big_2x/${g.cover.image_id}.jpg`
      : undefined,
    summary: g.summary,
    releaseDate: g.first_release_date
      ? new Date(g.first_release_date * 1000).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })
      : undefined,
    genres: g.genres?.map((x) => x.name) ?? [],
    platforms: g.platforms?.map((x) => x.name) ?? [],
    developers: companies.filter((c) => c.developer).map((c) => c.company.name),
    publishers: companies.filter((c) => c.publisher).map((c) => c.company.name),
    ratingCount: g.total_rating_count,
    backdropUrl: backdropId
      ? `${IMAGE_BASE}/t_1080p/${backdropId}.jpg`
      : undefined,
    igdbUrl: g.url,
  };
}

// For searching games by name
export async function searchGames(query: string): Promise<Game[]> {
  "use cache";
  cacheLife("hours");

  const clean = query
    .replace(/["\\;\r\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

  if (clean.length < 2) return [];

  const games = await igdbQuery<IgdbGame[]>(
    "games",
    `search "${clean}"; fields name,slug,first_release_date,total_rating,cover.image_id;limit 40;`,
  );

  return games
    .map(toGame)
    .filter((g) => g.coverUrl)
    .slice(0, 24);
}

{
  /* Below is used for browsing by specific fields */
}

export type NamedOption = { id: number; name: string; slug: string };
export type PlatformOption = NamedOption & { label: string };

export async function getGenres(): Promise<NamedOption[]> {
  "use cache";
  cacheLife("days");
  return igdbQuery<NamedOption[]>(
    "genres",
    "fields name,slug; sort name asc; limit 50;",
  );
}

// IGDB ids: PC, PS5, Xbox Series X|S, Switch, PS4, Xbox One, Mac, Linux
const PLATFORM_IDS = [6, 167, 169, 130, 48, 49, 14, 3];

export async function getPlatforms(): Promise<PlatformOption[]> {
  "use cache";
  cacheLife("days");

  const rows = await igdbQuery<NamedOption[]>(
    "platforms",
    `fields name,slug; where id = (${PLATFORM_IDS.join(",")}) | name = "Nintendo Switch 2"; limit 20;`,
  );

  const rank = (id: number) => {
    const i = PLATFORM_IDS.indexOf(id);
    return i === -1 ? 2.5 : i;
  };
  return rows
    .sort((a, b) => rank(a.id) - rank(b.id))
    .map((p) => ({ ...p, label: p.name.replace(" (Microsoft Windows)", "") }));
}

// IGDB popularity types: 1 = page visits, 2 = want to play, 4 = played
const POPULARITY_TYPES = { popular: 1, wanted: 2, played: 4 } as const;

async function getPopularityRanking(type: number): Promise<number[]> {
  "use cache";
  cacheLife("hours");
  const rows = await igdbQuery<{ game_id: number }[]>(
    "popularity_primitives",
    `fields game_id,value; where popularity_type = ${type}; sort value desc; limit 500;`,
  );
  return rows.map((r) => r.game_id);
}

export const PAGE_SIZE = 30;
const LIST_FIELDS =
  "fields name,slug,first_release_date,total_rating,cover.image_id;";

export type BrowseQuery = {
  q?: string;
  year?: number;
  month?: number;
  genreId?: number;
  platformId?: number;
  exclusive?: boolean;
  sort: "popular" | "wanted" | "played" | "rating";
  page: number;
};

function toPage(rows: IgdbGame[]) {
  return {
    games: rows
      .slice(0, PAGE_SIZE)
      .filter((g) => g.cover)
      .map(toGame),
    hasNext: rows.length > PAGE_SIZE, // we ask for one extra row to know
  };
}

export async function browseGames(
  query: BrowseQuery,
): Promise<{ games: Game[]; hasNext: boolean }> {
  "use cache";
  cacheLife("hours");

  // Build the "where" filters. Only numbers reach this point (the page looked up
  // genre and platform ids itself), so nothing user-typed lands in the query.
  const filters: string[] = [];
  if (query.year) {
    const start = Date.UTC(query.year, query.month ? query.month - 1 : 0, 1);
    const end = query.month
      ? Date.UTC(query.year, query.month, 1)
      : Date.UTC(query.year + 1, 0, 1);
    filters.push(
      `first_release_date >= ${start / 1000} & first_release_date < ${end / 1000}`,
    );
  }
  if (query.genreId) filters.push(`genres = (${query.genreId})`);
  if (query.platformId) {
    filters.push(
      query.exclusive
        ? `platforms = {${query.platformId}}`
        : `platforms = (${query.platformId})`,
    );
  }
  const offset = (query.page - 1) * PAGE_SIZE;

  // 1. Text search (results come back by relevance)
  const term = query.q
    ?.replace(/["\\;\r\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
  if (term && term.length >= 2) {
    const where = filters.length ? `where ${filters.join(" & ")};` : "";
    const rows = await igdbQuery<IgdbGame[]>(
      "games",
      `search "${term}"; ${LIST_FIELDS} ${where} limit ${PAGE_SIZE + 1}; offset ${offset};`,
    );
    return toPage(rows);
  }

  // 2. Highest rated (ignore games with very few ratings)
  if (query.sort === "rating") {
    const where = ["total_rating_count >= 25", ...filters].join(" & ");
    const rows = await igdbQuery<IgdbGame[]>(
      "games",
      `${LIST_FIELDS} where ${where}; sort total_rating desc; limit ${PAGE_SIZE + 1}; offset ${offset};`,
    );
    return toPage(rows);
  }

  // 3. Popularity sorts: take IGDB's top 500, apply the filters, keep its order
  const ranking = await getPopularityRanking(POPULARITY_TYPES[query.sort]);
  if (ranking.length === 0) return { games: [], hasNext: false };

  const where = [`id = (${ranking.join(",")})`, ...filters].join(" & ");
  const rows = await igdbQuery<IgdbGame[]>(
    "games",
    `${LIST_FIELDS} where ${where}; limit 500;`,
  );
  const position = new Map(ranking.map((id, i) => [id, i]));
  const ordered = rows
    .filter((g) => g.cover)
    .sort((a, b) => (position.get(a.id) ?? 0) - (position.get(b.id) ?? 0));

  return {
    games: ordered.slice(offset, offset + PAGE_SIZE).map(toGame),
    hasNext: ordered.length > offset + PAGE_SIZE,
  };
}
