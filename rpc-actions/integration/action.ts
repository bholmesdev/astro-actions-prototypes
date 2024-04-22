import type { APIContext } from "astro";
import { z } from "zod";
import { AsyncLocalStorage } from "node:async_hooks";

export const ApiContextStorage = new AsyncLocalStorage<APIContext>();

type MaybePromise<T> = T | Promise<T>;

export function defineAction<TOutput, TInputSchema extends z.ZodType>({
  input,
  handler,
  onSuccess,
  onError,
}: {
  input?: TInputSchema;
  handler: (
    input: z.infer<TInputSchema>,
    context: APIContext
  ) => MaybePromise<TOutput>;
  onSuccess?: (
    params: APIContext & {
      referer: string;
      output: TOutput;
    }
  ) => MaybePromise<Response | void>;
  onError?: (
    params: APIContext & {
      referer: string;
      rawInput: unknown;
      error: unknown;
    }
  ) => MaybePromise<Response | void>;
}): (input: z.input<TInputSchema>) => Promise<Awaited<TOutput>> {
  return async (unparsedInput): Promise<Awaited<TOutput>> => {
    let handlerInput = unparsedInput as z.infer<TInputSchema>;
    const context = ApiContextStorage.getStore()!;
    const Accept = context.request.headers.get("Accept");
    const referer = context.request.headers.get("Referer")!;
    if (input) {
      const parsed = input.safeParse(unparsedInput);
      if (!parsed.success) {
        const defaultError = new Response(JSON.stringify(parsed.error), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (Accept !== "application/json") {
          const serverResponse =
            (await onError?.({
              ...context,
              referer,
              rawInput: unparsedInput,
              error: parsed.error,
            })) ?? defaultError;
          throw serverResponse;
        }
        throw defaultError;
      }
      handlerInput = parsed.data;
    }
    const result = await handler(handlerInput, context);
    if (Accept !== "application/json") {
      const serverResponse = await onSuccess?.({
        ...context,
        referer,
        output: result,
      });
      throw (
        serverResponse ??
        new Response(null, {
          status: 302,
          headers: {
            Location: referer,
          },
        })
      );
    }
    return result;
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
