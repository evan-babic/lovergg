{
  /* Server-side heart of auth system 
     Tells BetterAuth to store users and sessions through Prisma, and allows for email+pw signin
     Hashing, cookies, token handling all done by the library */
}

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  plugins: [username({ minUsernameLength: 3, maxUsernameLength: 20 })],
  user: {
    additionalFields: {
      bio: { type: "string", required: false, input: true },
    },
  },
});
