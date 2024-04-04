// This will be code gen
export type ActionMap = {
  "/blog/like": typeof import("../src/pages/blog/like").action;
  "/blog/comment": typeof import("../src/pages/blog/comment").action;
};

export type ActionResult<T extends keyof ActionMap> = {
  param: Parameters<ActionMap[T]>[0];
  result: ReturnType<ActionMap[T]>;
};

export async function action<T extends keyof ActionMap>(
  path: T,
  param: ActionResult<T>["param"]
): Promise<ActionResult<T>["result"]> {
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
