import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  context.locals.getActionResult = (actionPath) => {
    const url = new URL(context.request.url);
    const action = url.searchParams.get("_action");
    console.log(action, actionPath);
    if (action !== actionPath) return undefined;
    const actionResult = new URL(context.request.url).searchParams.get(
      "_actionResult"
    );
    return actionResult ? JSON.parse(actionResult) : undefined;
  };
  return next();
});
