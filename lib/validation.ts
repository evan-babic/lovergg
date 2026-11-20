{
  /* Validation patterns via 'zod' for different schema */
}

import { z } from "zod";
import { USERNAME_PATTERN, isReservedUsername } from "@/lib/usernames";

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name")
    .max(50, "Keep it under 50 characters."),
  username: z
    .string()
    .trim()
    .min(3, "At least 3 characters")
    .max(20, "At most 20 characters")
    .regex(USERNAME_PATTERN, "Letters, numbers and underscores only")
    .refine(
      (value) => !isReservedUsername(value),
      "That username is not available",
    ),
  email: z.email("Enter a valid email address").trim(),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(128, "At most 128 characters"),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your username or email"),
  password: z.string().min(1, "Enter your password"),
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name")
    .max(50, "Keep it under 50 characters."),
  bio: z
    .string()
    .trim()
    .max(250, "Keep your bio under 250 characters")
    .transform((value) => (value === "" ? null : value)),
});
