"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import type {
  AuthAdapter,
  AuthFlowState,
  AuthResult,
  CallbackURLs,
} from "@rectangular-labs/auth/adapter/types";

function isSameState(left: AuthFlowState, right: AuthFlowState) {
  if (left.step !== right.step) {
    return false;
  }

  switch (left.step) {
    case "verification":
      return (
        right.step === "verification" &&
        left.info.identifier === right.info.identifier &&
        left.info.mode === right.info.mode &&
        left.info.trustDevice === right.info.trustDevice &&
        left.info.code === right.info.code
      );

    case "reset-password":
      return (
        right.step === "reset-password" &&
        left.token === right.token &&
        left.code === right.code &&
        left.identifier === right.identifier
      );

    case "2fa":
      return right.step === "2fa" && left.method === right.method;

    default:
      return true;
  }
}

/**
 * Configures the auth-flow state machine and wraps the provided adapter so
 * results automatically drive state transitions and callback URL defaults.
 */
export type UseAuthFlowOptions = {
  /**
   * Partial auth adapter implementation to wrap with auth-flow behavior.
   *
   * Any invoked method must be provided.
   */
  adapter: Partial<AuthAdapter>;
  /**
   * Initial step for the flow state machine.
   *
   * @default { step: "sign-in" }
   */
  initialState?: AuthFlowState;
  /**
   * Default callback URLs for when auth completes.
   */
  callbackURLs?: CallbackURLs;
  /**
   * Invoked after any state transition triggered by the flow.
   *
   * Useful for syncing the flow state to routing or other external state.
   */
  onTransition?: (state: AuthFlowState) => void | Promise<void>;
  /**
   * Client-side navigation used by the default success handler.
   *
   * @default `window.location.href = url`
   */
  navigate?: (url: string) => void | Promise<void>;
  /**
   * Invoked after any successful terminal auth action.
   *
   * @default navigates to `callbackURLs.success` if present
   */
  onSuccess?: () => void | Promise<void>;
  /**
   * Called for non-field auth errors after the adapter result is normalized.
   */
  onError?: (error: { message: string; code?: string | undefined }) => void | Promise<void>;
};

/**
 * State and actions returned by `useAuthFlow()`.
 */
export type UseAuthFlowReturn = {
  state: AuthFlowState;
  auth: AuthAdapter;
  handleResult: (result: AuthResult) => void;
  goTo: (state: AuthFlowState) => void;
  goBack: () => void;
  canGoBack: boolean;
};

export function useAuthFlow(options: UseAuthFlowOptions): UseAuthFlowReturn {
  const {
    adapter,
    initialState = { step: "sign-in" },
    callbackURLs,
    onTransition,
    navigate = (url: string) => {
      window.location.href = url;
    },
    onSuccess,
    onError,
  } = options;

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const [state, setState] = useState<AuthFlowState>(initialState);
  const historyRef = useRef<AuthFlowState[]>([]);

  const transitionTo = useCallback(
    (next: AuthFlowState, recordHistory: boolean) => {
      let shouldNotify = false;

      setState((prev) => {
        if (isSameState(prev, next)) {
          return prev;
        }

        if (recordHistory) {
          historyRef.current = [...historyRef.current, prev];
        }

        shouldNotify = true;
        return next;
      });

      if (shouldNotify) {
        void onTransition?.(next);
      }
    },
    [onTransition],
  );

  const handleResult = useCallback(
    (result: AuthResult) => {
      switch (result.type) {
        case "success":
          void onSuccessRef.current?.();
          break;

        case "error":
          void onErrorRef.current?.({ message: result.message, code: result.code });
          break;

        case "pending-redirect":
          void navigate(result.url);
          break;

        case "needs-verification":
          if (result.mode.startsWith("password-reset")) {
            transitionTo(
              {
                step: "reset-password",
                identifier: result.identifier,
              },
              true,
            );
            break;
          }
          transitionTo(
            {
              step: "verification",
              info: { mode: result.mode, identifier: result.identifier },
            },
            true,
          );
          break;

        case "needs-2fa":
          transitionTo({ step: "2fa", method: result.method }, true);
          break;
      }
    },
    [navigate, transitionTo],
  );

  const goTo = useCallback(
    (next: AuthFlowState) => {
      transitionTo(next, true);
    },
    [transitionTo],
  );
  const goBack = useCallback(() => {
    const previous = historyRef.current.pop();
    if (!previous) {
      return;
    }

    setState(previous);
  }, []);

  const canGoBack = historyRef.current.length > 0;

  const auth = useMemo<AuthAdapter>(() => {
    const urls = callbackURLs;

    function assertMethod<K extends keyof AuthAdapter>(name: K): AuthAdapter[K] {
      const method = adapter[name];
      if (!method) {
        throw new Error(
          `AuthAdapter method "${name}" is not implemented. ` +
            "Make sure your adapter provides this method.",
        );
      }

      return method as AuthAdapter[K];
    }

    const specialCases: Partial<{ [K in keyof AuthAdapter]: AuthAdapter[K] }> = {
      signInWithPassword: async (...args: Parameters<AuthAdapter["signInWithPassword"]>) => {
        const fn = assertMethod("signInWithPassword");
        const [values] = args;
        const mergedValues = {
          ...values,
          successCallbackUrl: values.successCallbackUrl ?? urls?.success,
        };
        const result = await fn(mergedValues);
        handleResult(result);
        return result;
      },
      signUpWithPassword: async (...args: Parameters<AuthAdapter["signUpWithPassword"]>) => {
        const fn = assertMethod("signUpWithPassword");
        const [values] = args;
        const mergedValues = {
          ...values,
          newUserCallbackUrl: values.newUserCallbackUrl ?? urls?.newUser ?? urls?.success,
        };
        const result = await fn(mergedValues);
        handleResult(result);
        return result;
      },
      sendCode: async (...args: Parameters<AuthAdapter["sendCode"]>) => {
        const fn = assertMethod("sendCode");
        const [info, callbackURLs] = args;
        const result = await fn(info, {
          ...urls,
          ...callbackURLs,
        });
        handleResult(result);
        return result;
      },
      signInWithSocial: async (...args: Parameters<AuthAdapter["signInWithSocial"]>) => {
        const fn = assertMethod("signInWithSocial");
        const [provider, options] = args;
        const result = await fn(provider, {
          ...options,
          callbackUrls: {
            ...urls,
            ...options?.callbackUrls,
          },
        });
        handleResult(result);
        return result;
      },
    };

    return new Proxy({} as AuthAdapter, {
      get(_target, prop: keyof AuthAdapter) {
        const specialCase = specialCases[prop];
        if (specialCase) {
          return specialCase;
        }

        return async (...args: unknown[]) => {
          const fn = assertMethod(prop);
          const result = await (fn as (...innerArgs: unknown[]) => Promise<AuthResult>)(...args);
          handleResult(result);
          return result;
        };
      },
    });
  }, [adapter, callbackURLs, handleResult]);

  return {
    state,
    auth,
    handleResult,
    goTo,
    goBack,
    canGoBack,
  };
}
