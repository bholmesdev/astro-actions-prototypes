import { APIContext } from "astro";
import { z } from "zod";
import { ApiContextStorage } from "./middleware";

export function action<TInputSchema extends z.AnyZodObject, TOutput>(
  handler: (context: APIContext) => TOutput
): (input: any) => Promise<Awaited<TOutput>>;
export function action<TInputSchema extends z.AnyZodObject, TOutput>(
  input: TInputSchema,
  handler: (input: z.infer<TInputSchema>, context: APIContext) => TOutput
): (input: z.infer<TInputSchema> | FormData) => Promise<Awaited<TOutput>>;
export function action<TInputSchema extends z.AnyZodObject, TOutput>(
  inputOrHandler: TInputSchema | ((context: APIContext) => TOutput),
  handler?: (input: z.infer<TInputSchema>, context: APIContext) => TOutput
): (input: z.infer<TInputSchema> | FormData) => Promise<Awaited<TOutput>> {
  const context = ApiContextStorage.getStore()!;
  if (typeof inputOrHandler === "function") {
    return async (): Promise<Awaited<TOutput>> => await inputOrHandler(context);
  }
  return async (unparsedInput): Promise<Awaited<TOutput>> => {
    const parsable =
      unparsedInput instanceof FormData
        ? // TODO: robust form data parsing a-la simple:form
          Object.fromEntries(unparsedInput as any)
        : unparsedInput;
    const inputArgs = inputOrHandler.safeParse(parsable);
    if (!inputArgs.success) {
      throw new Response(JSON.stringify(inputArgs.error), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    return await handler!(inputArgs.data, context);
  };
}
