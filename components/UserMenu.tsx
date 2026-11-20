import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";
import { getSession } from "@/lib/session";

export default async function UserMenu() {
  const session = await getSession();

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
      <li className="normal-case tracking-normal">
        {user.username ? (
          <Link
            href={`/${user.username}`}
            className="text-zinc-200 hover:text-white"
          >
            @{handle}
          </Link>
        ) : (
          <span className="text-zinc-200">@{handle}</span>
        )}
      </li>
      <li>
        <SignOutButton />
      </li>
    </>
  );
}
