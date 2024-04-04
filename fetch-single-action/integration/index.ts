import { fileURLToPath } from "node:url";
import { defineIntegration, addDts } from "astro-integration-kit";
import { readFile } from "node:fs/promises";
import { parse as esModuleParse } from "es-module-lexer";
import glob from "fast-glob";

export const actions = defineIntegration({
  name: "actions",
  setup() {
    return {
      async "astro:config:setup"(params) {
        const { config, updateConfig, addMiddleware } = params;
        const pagesDir = new URL("pages/", config.srcDir);
        const handlerCode = await readFile(
          new URL("handler.ts", import.meta.url),
          "utf-8"
        );

        const endpointFiles = await glob("**/*.{ts,js}", {
          cwd: fileURLToPath(pagesDir),
        });

        const actionFiles: string[] = [];
        for (const endpointFile of endpointFiles) {
          const [, exports] = esModuleParse(
            await readFile(new URL(endpointFile, pagesDir), "utf-8")
          );
          if (exports.some((e) => e.n === "action")) {
            actionFiles.push(endpointFile);
          }
        }

        addMiddleware({
          entrypoint: fileURLToPath(new URL("middleware.ts", import.meta.url)),
          order: "pre",
        });

        updateConfig({
          vite: {
            plugins: [
              {
                name: "actions:inject-POST",
                enforce: "pre",
                transform(code, id) {
                  let fileUrl: URL;
                  try {
                    fileUrl = new URL(id, "file://");
                  } catch {
                    return;
                  }
                  if (!fileUrl.href.startsWith(pagesDir.href)) return;

                  const [, exports] = esModuleParse(code);
                  if (!exports.some((e) => e.n === "action")) return;

                  const withHandler = `${handlerCode}\n${code}`;
                  return withHandler;
                },
              },
            ],
          },
        });

        addDts(params, {
          name: "fetch-single-action",
          content: `declare module "astro:actions" {
  export type Actions = {
    ${actionFiles.map(
      (file) =>
        `"/${file.replace(
          /\.[tj]s$/,
          ""
        )}": typeof import("../src/pages/${file}").action`
    )}
          }
        }`,
        });
      },
    };
  },
});
