import "server-only";
import { cacheLife } from "next/cache";
import type { Game } from "@/lib/types";

const IGDB_URL = "https://api.igdb.com/v4";

type PopularityRow = { game_id: number; value: number };
type IgdbGame = {
  id: number;
  name: string;
  slug: string;
  first_release_date?: number; // in unix seconds
  total_rating?: number; // 0 to 100
  cover?: { image_id: string };
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
