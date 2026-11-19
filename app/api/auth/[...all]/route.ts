{/* Catch-all endpoint that handles every sign-up, sign-in, sign-out requests */}

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);