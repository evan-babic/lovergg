import "server-only";
import { connection } from "next/server";
import prisma from "@/lib/prisma";
import { USERNAME_PATTERN } from "@/lib/usernames";

export async function getProfileByUsername(username: string) {
  await connection();

  // Reject junk early (like /favicon.ico) without touching the database.
  if (!USERNAME_PATTERN.test(username)) return null;

  return prisma.user.findUnique({
    // Usernames are stored lowercase, so /EvanB and /evanb find the same person.
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      name: true,
      username: true,
      displayUsername: true,
      bio: true,
      createdAt: true,
      _count: { select: { reviews: true } },
    },
  });
}