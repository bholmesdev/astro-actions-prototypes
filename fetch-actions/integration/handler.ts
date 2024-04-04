import type { APIContext } from "astro";
import { AsyncLocalStorage } from "node:async_hooks";

const formContentTypes = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
];

const ApiContextStorage = new AsyncLocalStorage<APIContext>();

export function getAPIContext() {
  return ApiContextStorage.getStore();
}

export const POST = async (ctx: APIContext) => {
  const { request, redirect } = ctx;
  const url = new URL(request.url).pathname;

  const { action } = ctx.params;
  if (!action) return new Response(null, { status: 404 });

  const actionsFiles = import.meta.glob("/src/pages/**/*.{js,ts}", {
    eager: true,
    import: "actions",
  });

  const baseUrl = url.replace(new RegExp(`.${action}$`), "");

  let actions: Record<string, any> | undefined;
  for (const actionsFile in actionsFiles) {
    const actionsRoute = actionsFile
      .replace(/\.[jt]s$/, "")
      .replace(/^\/src\/pages/, "");
    if (actionsRoute === prependForwardSlash(baseUrl)) {
      actions = actionsFiles[actionsFile] as any;
      break;
    }
  }
  if (!actions) return new Response(null, { status: 404 });

  const actionCallback = actions[action];

  if (!actionCallback)
    return new Response(
      `Action ${JSON.stringify(action)} does not exist on route.`,
      { status: 404 }
    );

  let args: unknown;
  const contentType = request.headers.get("Content-Type");
  if (contentType === "application/json") {
    args = await request.json();
  }
  if (formContentTypes.some((f) => contentType?.startsWith(f))) {
    args = await request.formData();
  }

  const result = await ApiContextStorage.run(ctx, () => actionCallback(args));

  if (request.headers.get("Accept") === "application/json") {
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  let redirectUrl = new URL(request.headers.get("Referer") || request.url);
  if (result) {
    redirectUrl.searchParams.set("_action", url);
    redirectUrl.searchParams.set("_actionResult", JSON.stringify(result));
  }

  return redirect(redirectUrl.href);
};

function prependForwardSlash(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}
