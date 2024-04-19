import type { APIContext } from "astro";
import { z } from "zod";
import { AsyncLocalStorage } from "node:async_hooks";

export const ApiContextStorage = new AsyncLocalStorage<APIContext>();

export function defineAction<TOutput, TInputSchema extends z.ZodType>({
  input,
  handler,
}: {
  input?: TInputSchema;
  handler: (input: z.infer<TInputSchema>, context: APIContext) => TOutput;
}): (input: z.input<TInputSchema>) => Promise<Awaited<TOutput>> {
  if (!input) {
    return async (unparsedInput): Promise<Awaited<TOutput>> => {
      const context = ApiContextStorage.getStore()!;
      return await handler(unparsedInput, context);
    };
  }
  return async (unparsedInput): Promise<Awaited<TOutput>> => {
    const context = ApiContextStorage.getStore()!;
    const inputArgs = input.safeParse(unparsedInput);
    if (!inputArgs.success) {
      throw new Response(JSON.stringify(inputArgs.error), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    return await handler(inputArgs.data, context);
  };
}

export function formData<T extends z.ZodRawShape>(schema: T) {
  return z.preprocess((formData, ctx) => {
    if (!(formData instanceof FormData)) {
      ctx.addIssue({
        code: "custom",
        message: "Expected FormData",
        path: [],
      });
      return;
    }
    const obj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema)) {
      // TODO: refine, unit test
      if (value instanceof z.ZodBoolean) {
        obj[key] = formData.has(key);
      } else if (value instanceof z.ZodArray) {
        obj[key] = Array.from(formData.getAll(key));
      } else if (value instanceof z.ZodNumber) {
        obj[key] = Number(formData.get(key));
      } else {
        obj[key] = formData.get(key);
      }
    }
    return obj;
  }, z.object(schema)) as z.ZodEffects<
    z.ZodObject<T>,
    z.ZodObject<T>["_output"],
    FormData
  >;
}
