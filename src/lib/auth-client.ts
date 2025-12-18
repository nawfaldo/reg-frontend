import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://reg-backend-psi.vercel.app",
});
