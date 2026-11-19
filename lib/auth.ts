{
  /* Server-side heart of auth system 
     Tells BetterAuth to store users and sessions through Prisma, and allows for email+pw signin
     Hashing, cookies, token handling all done by the library */
}

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import prisma from "@/lib/prisma";
import { USERNAME_PATTERN, isReservedUsername } from "@/lib/usernames";

// Preview deployments get a new URL each time, so trust only this deployment's own hosts.
const baseURL =
  process.env.VERCEL_ENV === "preview"
    ? {
        allowedHosts: [
          process.env.VERCEL_URL,
          process.env.VERCEL_BRANCH_URL,
        ].filter((host): host is string => Boolean(host)),
        protocol: "https" as const,
      }
    : process.env.BETTER_AUTH_URL;

export const auth = betterAuth({
  baseURL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  plugins: [username({ minUsernameLength: 3, maxUsernameLength: 20 })],
  usernameValidator: (value: string) => USERNAME_PATTERN.test(value) && !isReservedUsername(value),
  user: {
    additionalFields: {
      bio: { type: "string", required: false, input: true },
    },
  },
});
