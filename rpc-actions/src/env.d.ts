/// <reference path="../.astro/db-types.d.ts" />
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module "test:actions" {
  type Actions = typeof import("./actions")["default"];

  export const actions: Actions;
}
