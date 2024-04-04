import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import db from "@astrojs/db";

import react from "@astrojs/react";
import { actions } from "./integration/index.ts";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  output: "hybrid",
  integrations: [mdx(), sitemap(), db(), react(), actions()],
});
