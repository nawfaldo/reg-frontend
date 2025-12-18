import { treaty } from "@elysiajs/eden";
import type { App } from "./server";

export const api = treaty<App>(import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_SERVER_URL || "http://localhost:3000", {
  fetch: {
    credentials: "include",
  },
});
