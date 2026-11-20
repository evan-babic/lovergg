import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md px-6 py-32">
      <h1 className="text-4xl font-bold tracking-tight text-center">Welcome back</h1>
      <p className="text-sm mt-1 text-zinc-400 text-center">
        Sign in to rate and review games.
      </p>
      <div className="mt-8 rounded-xl bg-zinc-900 p-6 ring-1 ring-zinc-800">
        <LoginForm />
      </div>
    </section>
  );
}
