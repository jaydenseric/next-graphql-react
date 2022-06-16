// @ts-check

import { createServer } from "http";
import { createRequire } from "module";

import listen from "./listen.mjs";

const require = createRequire(import.meta.url);

/**
 * Starts Next.js.
 * @param {string} dir Next.js project directory path.
 * @returns Resolves the port the server is listening on, and a function to
 *   close the server.
 */
export default async function startNext(dir) {
  const next = require(require.resolve("next", { paths: [dir] }));
  const nextServer = next({ dir });
  const server = createServer(nextServer.getRequestHandler());

  return listen(server);
}
