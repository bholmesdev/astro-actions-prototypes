import type { APIRoute } from "astro";
import actions from "../src/actions";
import { ApiContextStorage } from "./action";

function getAction(pathKeys: string[]): Function {
  let actionObj: any = actions;
  for (const key of pathKeys) {
    if (!(key in actionObj)) {
      throw new Error("Action not found");
    }
    actionObj = actionObj[key];
  }
  if (typeof actionObj !== "function") {
    throw new Error("Action not found");
  }
  return actionObj;
}

export const POST: APIRoute = async (context) => {
  const { request, url, redirect } = context;
  if (request.method !== "POST") {
    return new Response(null, { status: 405 });
  }
  const actionPathKeys = url.pathname.replace("/_actions/", "").split(".");
  const action = getAction(actionPathKeys);
  const contentType = request.headers.get("Content-Type");
  let args: any;
  if (contentType === "application/json") {
    args = await request.clone().json();
  }
  if (formContentTypes.some((f) => contentType?.startsWith(f))) {
    args = await request.clone().formData();
  }
  let result: unknown;
  try {
    result = await ApiContextStorage.run(context, () => action(args));
  } catch (e) {
    if (e instanceof Response) {
      return e;
    }
    throw e;
  }
  if (request.headers.get("Accept") === "application/json") {
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  let redirectUrl = new URL(request.headers.get("Referer") || request.url);
  if (result) {
    redirectUrl.searchParams.set("_action", url.pathname);
    redirectUrl.searchParams.set("_actionResult", JSON.stringify(result));
  }

  return redirect(redirectUrl.href);
};

const formContentTypes = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
];
