import {
  decrypt,
  deleteCookie,
  encrypt,
  getCookie,
  type SetCookieOptions,
  setCookie,
} from "@orpc/server/helpers";
import { type AsyncContext, getContext } from "./context-storage";

interface SessionConfig {
  name?: string;
  password: string;
  cookie?: SetCookieOptions;
  generateId?: () => string;
}

// biome-ignore lint/suspicious/noExplicitAny: user defined types
type SessionData<T extends Record<string, any>> = T;
// biome-ignore lint/suspicious/noExplicitAny: user defined types
interface Session<T extends Record<string, any>> {
  id: string;
  createdAt: number;
  data: SessionData<T>;
}

const DEFAULT_NAME = "app_session";
const DEFAULT_COOKIE_SETTINGS = {
  path: "/",
  secure: true,
  httpOnly: true,
};

// biome-ignore lint/suspicious/noExplicitAny: user defined types
function getSessionContext<T extends Record<string, any>>(
  contextOverride?: AsyncContext,
): Record<string, Session<T> & { [getSessionPromise]?: Promise<Session<T>> }> {
  const context = contextOverride ?? getContext();
  return (
    context.get<Record<
      string,
      Session<T> & { [getSessionPromise]?: Promise<Session<T>> }
    > | null>("sessions") ?? {}
  );
}

const getSessionPromise = Symbol("getSession");
// biome-ignore lint/suspicious/noExplicitAny: user defined types
async function getSession<T extends Record<string, any>>(
  config: SessionConfig,
): Promise<Session<T>> {
  const sessionName = config.name || DEFAULT_NAME;

  const context = getContext();
  const currentSessions = getSessionContext<T>(context);

  if (Object.keys(currentSessions).length === 0) {
    context.set("sessions", currentSessions);
  }

  const existingSession = currentSessions[sessionName];
  if (existingSession) {
    return existingSession[getSessionPromise] || existingSession;
  }

  const session = {
    id: "",
    createdAt: 0,
    data: Object.create(null),
  };
  currentSessions[sessionName] = session;

  const sealedSession = getCookie(context.reqHeaders, sessionName);
  console.log("sealedSession", sealedSession);
  if (sealedSession) {
    const promise = decrypt(sealedSession, config.password)
      .catch(() => ({}))
      .then((unsealed) => {
        if (typeof unsealed !== "string") {
          return {} as Session<T>;
        }
        Object.assign(session, JSON.parse(unsealed));
        delete currentSessions[sessionName]?.[getSessionPromise];
        return session;
      });

    currentSessions[sessionName][getSessionPromise] = promise;
    await promise;
  }
  console.log("session", session);
  if (!session.id) {
    session.id = config.generateId?.() ?? crypto.randomUUID();
    session.createdAt = Date.now();
    await updateSession(config);
  }
  return session;
}

// biome-ignore lint/suspicious/noExplicitAny: user defined types
type SessionUpdate<T extends Record<string, any>> =
  | T
  | ((oldData: T) => T | undefined);

// biome-ignore lint/suspicious/noExplicitAny: user defined types
async function updateSession<T extends Record<string, any>>(
  config: SessionConfig,
  update?: SessionUpdate<T>,
) {
  const sessionName = config.name || DEFAULT_NAME;

  const context = getContext();
  const currentSessions = getSessionContext<T>(context);
  const session = currentSessions[sessionName] || (await getSession(config));
  if (typeof update === "function") {
    update = update(session.data);
  }
  if (update) {
    Object.assign(session.data, update);
  }

  if (config.cookie) {
    const sealed = await encrypt(JSON.stringify(session), config.password);
    setCookie(context.resHeaders, sessionName, sealed, {
      ...DEFAULT_COOKIE_SETTINGS,
      ...config.cookie,
    });
  }
  return session;
}

// biome-ignore lint/suspicious/noExplicitAny: user defined types
function clearSession<T extends Record<string, any>>(config: SessionConfig) {
  const sessionName = config.name || DEFAULT_NAME;
  const context = getContext();
  const currentSessions = getSessionContext<T>(context);
  if (currentSessions[sessionName]) {
    delete currentSessions[sessionName];
  }
  deleteCookie(context.resHeaders, sessionName);
  return Promise.resolve();
}

export async function useSession<
  // biome-ignore lint/suspicious/noExplicitAny: user defined types
  T extends Record<string, any> = SessionData<any>,
>(config: SessionConfig) {
  const sessionName = config.name || DEFAULT_NAME;
  await getSession(config);
  const session = getSessionContext<T>()[sessionName];
  const sessionManager = {
    get id() {
      return session?.id;
    },
    get data(): T | null {
      return session?.data ?? null;
    },
    update: async (update: SessionUpdate<T>) => {
      await updateSession(config, update);
      return sessionManager;
    },
    clear: async () => {
      await clearSession<T>(config);
      return sessionManager;
    },
  };
  return sessionManager;
}
