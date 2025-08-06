import fs from "node:fs";
import { minifyContractRouter } from "@orpc/contract";
import { unlazyRouter } from "@orpc/server";
import { router } from "../routes";

const resolvedRouter = await unlazyRouter(router);
const minifiedRouter = minifyContractRouter(resolvedRouter);
fs.writeFileSync(
  "./src/_open-api/orpc-contract.json",
  JSON.stringify(minifiedRouter),
);
