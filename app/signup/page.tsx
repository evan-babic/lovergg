import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Join lover.gg</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Track the games you play, rate them, and share your favorites.
      </p>
      <div className="mt-8 rounded-xl bg-zinc-900 p-6 ring-1 ring-zinc-800">
        <SignUpForm />
      </div>
    </section>
  );
}
