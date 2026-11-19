{ /* Browser-side helpers called by forms */}

import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession } = createAuthClient();