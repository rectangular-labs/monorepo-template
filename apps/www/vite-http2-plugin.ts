import { Buffer } from "node:buffer";
import { IncomingMessage } from "node:http";
import { Readable } from "node:stream";
import type { Plugin } from "vite";

// Temporary, less than ideal hotfix until h3 support http2
export function http2(): Plugin {
  return {
    name: "http2",
    configureServer(server) {
      server.middlewares.use((req, _, next) => {
        if (req.httpVersionMajor >= 2 && req.headers[":method"]) {
          const chunks: Buffer[] = [];

          req.on("data", (chunk) => {
            chunks.push(chunk);
          });

          req.on("end", () => {
            const buffer = Buffer.concat(chunks);
            // biome-ignore lint/suspicious/noExplicitAny: temp workaround
            const r = new Readable() as any;

            const headers = Object.fromEntries(
              Object.entries(req.headers).filter(
                ([key]) => !key.startsWith(":"),
              ),
            );
            headers.host = req.headers[":authority"] as string;

            r.method = req.headers[":method"];
            r.url = req.headers[":path"];
            r.headers = headers;

            r.push(buffer);
            r.push(null);

            Object.setPrototypeOf(req, IncomingMessage.prototype);
            Object.assign(req, r);

            next();
          });

          req.on("error", (err) => next(err));
        } else {
          next();
        }
      });
    },
  };
}
