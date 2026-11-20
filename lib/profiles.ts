import "server-only";
import prisma from "@/lib/prisma";
import { USERNAME_PATTERN } from "@/lib/usernames";

export async function getProfileByUsername(username: string) {
    // Rejects junk early without touching database
    if (!USERNAME_PATTERN.test(username)) return null;

    return prisma.user.findUnique({
        where: { username: username.toLowerCase() },
        select: {
            id: true,
            name: true,
            username: true,
            displayUsername: true,
            bio: true,
            createdAt: true,
            _count: { select: { reviews: true }},
        },
    });
}