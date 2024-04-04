import { fileURLToPath } from "node:url";
import { addDts, defineIntegration } from "astro-integration-kit";
import { readFile } from "node:fs/promises";
import { parse as esModuleParse } from "es-module-lexer";
import glob from "fast-glob";

export const actions = defineIntegration({
  name: "actions",
  setup() {
    return {
      async "astro:config:setup"(params) {
        const { injectRoute, config, addMiddleware } = params;
        const pagesDir = new URL("pages/", config.srcDir);

        const endpointFiles = await glob("**/*.{ts,js}", {
          cwd: fileURLToPath(pagesDir),
        });

        const actionFiles: string[] = [];
        for (const endpointFile of endpointFiles) {
          const [, exports] = esModuleParse(
            await readFile(new URL(endpointFile, pagesDir), "utf-8")
          );
          if (exports.some((e) => e.n === "actions")) {
            injectRoute({
              prerender: false,
              pattern: `/${endpointFile.replace(/\.[tj]s$/, "")}.[action]`,
              entrypoint: fileURLToPath(new URL("handler.ts", import.meta.url)),
            });
            actionFiles.push(endpointFile);
          }
        }

        addMiddleware({
          entrypoint: fileURLToPath(new URL("middleware.ts", import.meta.url)),
          order: "pre",
        });

        addDts(params, {
          name: "fetch-actions",
          content: `declare module "astro:actions" {
  export type Actions = {
    ${actionFiles.map(
      (file) =>
        `"/${file.replace(
          /\.[tj]s$/,
          ""
        )}": typeof import("../src/pages/${file}").actions`
    )}
          }
        }`,
        });
      },
    };
  },
});
