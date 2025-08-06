import { AsyncLocalStorage } from "node:async_hooks";
import { os } from "@orpc/server";
import type { InitialContext } from "../types";

export interface AsyncContext {
  get: <T>(key: string) => T;
  set: <T>(key: string, value: T) => void;
}

const asyncLocalStorage = new AsyncLocalStorage<
  InitialContext & AsyncContext
>();

export const asyncStorageMiddleware = os
  .$context<InitialContext>()
  .middleware(async ({ next, context }) => {
    const mapStore = new Map<string, unknown>();

    return await asyncLocalStorage.run(
      {
        ...context,
        get: <T>(key: string) => mapStore.get(key) as T,
        set: <T>(key: string, value: T) => {
          mapStore.set(key, value);
        },
      },
      next,
    );
  });

export function getContext() {
  const context = asyncLocalStorage.getStore();
  if (!context) {
    throw new Error(
      "Context not available. Make sure to use the      `asyncStorageMiddleware`",
    );
  }
  return context;
}
