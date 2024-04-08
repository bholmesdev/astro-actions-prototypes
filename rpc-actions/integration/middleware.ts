import type { APIContext } from "astro";
import { AsyncLocalStorage } from "node:async_hooks";

export const ApiContextStorage = new AsyncLocalStorage<APIContext>();
