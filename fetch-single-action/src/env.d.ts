/// <reference path="../.astro/db-types.d.ts" />
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  type ActionMap = import("../integration/action").ActionMap;
  type ActionResult<T extends keyof ActionMap> =
    import("../integration/action").ActionResult<T>;

  interface Locals {
    getActionResult<T extends keyof ActionMap>(
      path: T
    ): Awaited<ActionResult<T>["result"]> | undefined;
  }
}
