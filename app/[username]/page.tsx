import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getProfileByUsername } from "@/lib/profiles";

type Params = Promise<{ username: string }>;

export default function ProfilePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile params={params} />
    </Suspense>
  );
}

async function Profile({ params }: { params: Params }) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  if (profile.username && username !== profile.username) {
    redirect(`/${profile.username}`);
  }

  const handle = profile.displayUsername || profile.username;
  const joined = profile.createdAt.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const reviewCount = profile._count.reviews;

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-5">
        <div
          aria-hidden="true"
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-3xl font-bold text-white"
        >
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
          <p className="text-sm text-zinc-400">@{handle}</p>
        </div>
      </div>

      {profile.bio && (
        <p className="mt-6 max-w-2xl whitespace-pre-line leading-relaxed text-zinc-300">
          {profile.bio}
        </p>
      )}

      <p className="mt-4 text-xs uppercase tracking-wider text-zinc-500">
        {reviewCount} {reviewCount === 1 ? "review" : "reviews"} · Joined{" "}
        {joined}
      </p>

      {/* Favorites */}
      <div className="mt-12">
        <h2 className="mb-4 border-b border-zinc-800 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Favorite Games
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((slot) => (
            <div
              key={slot}
              className="aspect-3/4 rounded-lg border border-dashed border-zinc-800"
            />
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="mt-12">
        <h2 className="mb-4 border-b border-zinc-800 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Recent Reviews
        </h2>
        <p className="text-sm text-zinc-500">
          {profile.name} hasn’t reviewed any games yet.
        </p>
      </div>
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-6 py-12">
      <div className="flex items-center gap-5">
        <div className="h-20 w-20 rounded-full bg-zinc-800" />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded bg-zinc-800" />
          <div className="h-4 w-24 rounded bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
