import { fileURLToPath } from "node:url";
import { addVirtualImports, defineIntegration } from "astro-integration-kit";
import { readFile } from "node:fs/promises";

export default defineIntegration({
  name: "rpc-actions",
  setup() {
    return {
      async "astro:config:setup"(params) {
        params.injectRoute({
          pattern: "/_actions/[...path]",
          entrypoint: fileURLToPath(new URL("./handler.ts", import.meta.url)),
          prerender: false,
        });
        addVirtualImports(params, {
          name: "rpc-actions",
          imports: {
            "test:actions": await readFile(
              new URL("./virtual.js", import.meta.url),
              "utf-8"
            ),
          },
        });
      },
    };
  },
});
