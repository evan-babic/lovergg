import { Suspense } from "react";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/settings/ProfileForm";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default function SettingsPage() {
    return (
        <section className="mx-auto max-w-xl px-6 py-12">
            <h1 className="border-b border-zinc-800 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Edit profile
            </h1>
            <div className="mt-8">
                <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
                <SettingsContent />
                </Suspense>
            </div>
        </section>
    )
}

async function SettingsContent() {
    const session = await getSession();
    if (!session) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, bio: true, username: true },
    });
    if (!user?.username) redirect("/login");

    return (
        <ProfileForm initialName={user.name} initialBio={user.bio ?? ""} username={user.username} />
    )
}