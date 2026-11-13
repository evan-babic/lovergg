// Basic footer code

export default async function Footer() {
    "use cache";
  return (
    <footer className="mt-24 border-t border-zinc-800">
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-zinc-500">
        <p>@ {new Date().getFullYear()} GameLog. A portfolio project.</p>
        <p className="mt-1">Game data provided by IGDB.</p>
      </div>
    </footer>
  );
}
