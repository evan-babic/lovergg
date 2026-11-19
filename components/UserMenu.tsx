import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function UserMenu() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <>
        <li>
          <Link href="/login" className="hover:text-white">
            Sign in
          </Link>
        </li>
        <li>
          <Link href="/signup" className="hover:text-white">
            Create account
          </Link>
        </li>
      </>
    );
  }

  const { user } = session;
  const handle = user.displayUsername || user.username || user.name;

  return (
    <>
      <li className="normal-case tracking-normal text-zinc-200">@{handle}</li>
      <li>
        <SignOutButton />
      </li>
    </>
  );
}
