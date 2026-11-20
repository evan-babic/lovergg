"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Field from "@/components/auth/Field";
import { signIn } from "@/lib/auth-client";
import { loginSchema } from "@/lib/validation";

type FieldName = "identifier" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;

export default function LoginForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const form = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({
      identifier: String(form.get("identifier") ?? ""),
      password: String(form.get("password") ?? ""),
    });

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldName;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setPending(true);

    const { identifier, password } = parsed.data;
    const result = identifier.includes("@")
      ? await signIn.email({ email: identifier, password })
      : await signIn.username({ username: identifier, password });

    if (result.error) {
      setFormError(
        result.error.status === 429
          ? "Too many attempts. Please wait a moment and try again."
          : "Incorrect username, email, or password.",
      );
      setPending(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && (
        <p
          role="alert"
          className="rounded-md bg-red-950/60 px-3 py-2 text-sm text-red-300 ring-1 ring-red-900"
        >
          {formError}
        </p>
      )}
      <Field
        label="Username or email"
        name="identifier"
        autoComplete="username"
        error={errors.identifier}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        error={errors.password}
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-zinc-400">
        New here?{" "}
        <Link href="/signup" className="text-white hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}