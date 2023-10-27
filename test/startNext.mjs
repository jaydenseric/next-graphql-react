// @ts-check

import { createServer } from "node:http";
import { createRequire } from "node:module";

import listen from "./listen.mjs";

const require = createRequire(import.meta.url);

/**
 * Starts Next.js.
 * @param {string} dir Next.js project directory path.
 * @returns Resolves the port the server is listening on, and a function to
 *   close the server.
 */
export default async function startNext(dir) {
  /** @type {import("next").default} */
  const next = require(require.resolve("next", { paths: [dir] }));

  const nextServer = next({ dir });
  const nextRequestHandler = nextServer.getRequestHandler();

  await nextServer.prepare();

  const server = createServer(nextRequestHandler);

  return await listen(server);
}
