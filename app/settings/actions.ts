"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { profileSchema } from "@/lib/validation";

export async function updateProfile(input: {
    name: string;
    bio: string;
}): Promise<{ errors?: Partial<Record<"name" | "bio", string>>; message?: string }> {
    // Validating who is making request (gets from auth session, not browser)
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");

    // Validates on the server
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) {
        const errors: Partial<Record<"name" | "bio" , string>> = {};
        for (const issue of parsed.error.issues) {
            const key = issue.path[0] as "name" | "bio";
            if (!errors[key]) errors[key] = issue.message;
        }
        return { errors };
    }

    // Save only the fields allowed, only on the signed-in user's own row.
    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { name: parsed.data.name, bio: parsed.data.bio },
        select: { username: true },
    });
    if (!user.username) redirect("/");

    // Refreshes profile to see changes
    const path = `/${user.username}`;
    revalidatePath(path);
    redirect(path);
}
