export default function PopularReviews() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-16">
      <h2 className="mb-4 border-b border-zinc-800 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Popular reviews
      </h2>
      {/* Later: render the most-liked recent reviews here. */}
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-zinc-800 px-6 text-center text-sm text-zinc-500">
        Popular reviews will appear here once people start writing them.
      </div>
    </section>
  );
}