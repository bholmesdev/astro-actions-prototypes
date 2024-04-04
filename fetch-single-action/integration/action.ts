import type { Actions } from "astro:actions";

export async function action<T extends keyof Actions>(
  path: T,
  param: Parameters<Actions[T]>[0]
): Promise<ReturnType<Actions[T]>> {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  let body: any = param;
  if (!(body instanceof FormData)) {
    body = JSON.stringify(param);
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(path, {
    method: "POST",
    body,
    headers,
  });
  return res.json();
}
