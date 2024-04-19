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
        const { srcDir } = params.config;
        addVirtualImports(params, {
          name: "rpc-actions",
          imports: [
            {
              id: "test:actions",
              content: await readFile(
                new URL("./virtual.js", import.meta.url),
                "utf-8"
              ),
              context: "client",
            },

            {
              id: "test:actions",
              content: `import _actions from '${srcDir}actions';\nexport const actions = _actions;`,
              context: "server",
            },
          ],
        });
      },
    };
  },
});
