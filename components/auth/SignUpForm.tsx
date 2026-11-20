"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Field from "@/components/auth/Field";
import { signUp } from "@/lib/auth-client";
import { signUpSchema } from "@/lib/validation";

type FieldName = "name" | "username" | "email" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;

export default function SignUpForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Next.js keeps a hidden page's state alive when you navigate away, so without this
  // the form would come back filled in and stuck on "Creating account…".
  useLayoutEffect(() => {
    const form = formRef.current;
    return () => {
      form?.reset();
      setErrors({});
      setFormError(null);
      setPending(false);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const form = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      name: String(form.get("name") ?? ""),
      username: String(form.get("username") ?? ""),
      email: String(form.get("email") ?? ""),
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

    const { error } = await signUp.email(parsed.data);

    if (error) {
      setFormError(
        error.message ?? "We couldn't create your account. Please try again.",
      );
      setPending(false);
      return;
    }

    router.push(`/${parsed.data.username.toLowerCase()}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" ref={formRef}>
      {formError && (
        <p
          role="alert"
          className="rounded-md bg-red-950/60 px-3 py-2 text-sm text-red-300 ring-1 ring-red-900"
        >
          {formError}
        </p>
      )}
      <Field label="Name" name="name" autoComplete="name" error={errors.name} />
      <Field
        label="Username"
        name="username"
        autoComplete="username"
        hint="3–20 characters: letters, numbers, underscores."
        error={errors.username}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        error={errors.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters."
        error={errors.password}
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="text-white hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
