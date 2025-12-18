import { treaty } from "@elysiajs/eden";
import type { App } from "./server";

export const api = treaty<App>("https://reg-backend-psi.vercel.app", {
  fetch: {
    credentials: "include",
  },
});
