import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import rpcActions from "./integration";

import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: "https://example.com",
  integrations: [mdx(), sitemap(), db(), rpcActions()],
});
