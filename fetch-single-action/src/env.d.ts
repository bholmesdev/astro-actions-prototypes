/// <reference path="../.astro/db-types.d.ts" />
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="../.astro/fetch-single-action.d.ts" />

type Actions = import("astro:actions").Actions;

declare namespace App {
  interface Locals {
    getActionResult<T extends keyof Actions>(
      path: T
    ): Awaited<ReturnType<Actions[T]>> | undefined;
  }
}
