import { fileURLToPath } from "node:url";
import { defineIntegration } from "astro-integration-kit";
import { readFile } from "node:fs/promises";
import { parse as esModuleParse } from "es-module-lexer";

export const actions = defineIntegration({
  name: "actions",
  setup() {
    return {
      async "astro:config:setup"({
        injectRoute,
        config,
        updateConfig,
        addMiddleware,
      }) {
        const pagesDir = new URL("pages/", config.srcDir);
        const handlerCode = await readFile(
          new URL("handler.ts", import.meta.url),
          "utf-8"
        );

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
      },
    };
  },
});
