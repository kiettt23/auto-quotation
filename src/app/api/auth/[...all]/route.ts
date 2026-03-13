import { auth } from "@/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Better Auth catch-all handler — handles all /api/auth/* routes
export const { GET, POST } = toNextJsHandler(auth);
