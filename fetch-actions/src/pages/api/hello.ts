// src/pages/api/hello.ts
import { defineApiRoute } from "astro-typed-api/server";

export const GET = defineApiRoute({
  fetch: (name: string) => `Hello, ${name}!`,
});
