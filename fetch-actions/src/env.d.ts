/// <reference path="../.astro/db-types.d.ts" />
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="../.astro/typed-api.d.ts" />

/// <reference types="../.astro/fetch-actions.d.ts" />

type Actions = import("astro:actions").Actions;
type ActionCallback<
  TBase extends keyof Actions,
  TAction extends keyof Actions[TBase]
> = Extract<Actions[TBase][TAction], (...args: any[]) => any>;

declare namespace App {
  declare function getActionResult<
    TBase extends keyof Actions,
    TAction extends keyof Actions[TBase]
  >(
    path: `${TBase}.${Extract<TAction, string>}`
  ): Awaited<ReturnType<ActionCallback<TBase, TAction>>> | undefined;

  interface Locals {
    getActionResult: typeof getActionResult;
  }
}
