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

  let args: unknown;
  const contentType = request.headers.get("Content-Type");
  if (contentType === "application/json") {
    args = await request.json();
  }
  if (formContentTypes.some((f) => contentType?.startsWith(f))) {
    args = await request.formData();
  }

  // @ts-expect-error `handler` is injected
  // into routes with an `action` export.
  // assume `action` exists in scope.
  const result = await ApiContextStorage.run(ctx, () => action(args));

  if (request.headers.get("Accept") === "application/json") {
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  let redirectUrl = new URL(request.headers.get("Referer") || request.url);
  if (result) {
    redirectUrl.searchParams.set("_action", new URL(request.url).pathname);
    redirectUrl.searchParams.set("_actionResult", JSON.stringify(result));
  }

  return redirect(redirectUrl.href);
};
