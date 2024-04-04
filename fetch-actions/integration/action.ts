import type { Actions } from "astro:actions";

export type ActionCallback<
  TBase extends keyof Actions,
  TAction extends keyof Actions[TBase]
> = Extract<Actions[TBase][TAction], (...args: any[]) => any>;

export async function action<
  TBase extends keyof Actions,
  TAction extends keyof Actions[TBase]
>(
  path: `${TBase}.${Extract<TAction, string>}`,
  param: Parameters<ActionCallback<TBase, TAction>>[0]
): Promise<Awaited<ReturnType<ActionCallback<TBase, TAction>>>> {
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
