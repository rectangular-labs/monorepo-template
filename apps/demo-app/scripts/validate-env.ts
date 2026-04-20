import { createJiti } from "jiti";
import { serverEnv } from "~/lib/env";

const jiti = createJiti(import.meta.url);
const env = await jiti.import("../src/lib/env");
// Parse all required env vars before build starts.
(env as { serverEnv: () => ReturnType<typeof serverEnv> }).serverEnv();
