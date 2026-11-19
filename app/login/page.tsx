import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Sign in to rate and review games.
      </p>
      <div className="mt-8 rounded-xl bg-zinc-900 p-6 ring-1 ring-zinc-800">
        <LoginForm />
      </div>
    </section>
  );
}
