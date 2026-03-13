"use client";

import { createAuthClient } from "better-auth/react";

// Better Auth client — use in client components for sign-in, sign-out, useSession
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "",
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient;
