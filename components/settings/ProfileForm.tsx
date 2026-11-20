"use client";

import { useLayoutEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Field from "@/components/auth/Field";
import { updateProfile } from "@/app/settings/actions";
import { profileSchema } from "@/lib/validation";

type FieldErrors = Partial<Record<"name" | "bio", string>>;

export default function ProfileForm({
  initialName,
  initialBio,
  username,
}: {
  initialName: string;
  initialBio: string;
  username: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useLayoutEffect(() => {
    const form = formRef.current;
    return () => {
      form?.reset();
      setErrors({});
      setFormError(null);
    };
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const data = new FormData(e.currentTarget);
    const input = {
      name: String(data.get("name") ?? ""),
      bio: String(data.get("bio") ?? ""),
    };

    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = await updateProfile(input);
      if (result.errors) setErrors(result.errors);
      if (result.message) setFormError(result.message);
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
    >
      {formError && (
        <p
          role="alert"
          className="rounded-md bg-red-950/60 px-3 py-2 text-sm text-red-300 ring-1 ring-red-900"
        >
          {formError}
        </p>
      )}

      <Field
        label="name"
        name="name"
        autoComplete="name"
        defaultValue={initialName}
        error={errors.name}
      />

      <div>
        <label
          htmlFor="bio"
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-400"
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={5}
          maxLength={250}
          defaultValue={initialBio}
          aria-invalid={errors.bio ? true : undefined}
          className="mt-1 w-full rounded-md bg-zinc-800 px-3 py-2 text-sm text-white outline-none ring-1 ring-zinc-700 focus:ring-2 focus:ring-indigo-500"
        />
        {errors.bio ? (
          <p className="mt-1 text-xs text-red-400">{errors.bio}</p>
        ) : (
          <p className="mt-1 text-xs text-zinc-500">Up to 250 characters.</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link
          href={`/${username}`}
          className="text-sm text-zinc-400 hover:text-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
