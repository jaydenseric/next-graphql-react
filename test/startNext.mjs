// @ts-check

import { createServer } from "node:http";

import next from "next";

import cjsDefaultImport from "../cjsDefaultImport.mjs";
import listen from "./listen.mjs";

// Workaround broken Next.js types.
const nextCreateServer = cjsDefaultImport(next);

/**
 * Starts Next.js.
 * @param {string} dir Next.js project directory path.
 * @returns Resolves the port the server is listening on, and a function to
 *   close the server.
 */
export default async function startNext(dir) {
  const nextServer = nextCreateServer({ dir });
  const nextRequestHandler = nextServer.getRequestHandler();

  await nextServer.prepare();

  const server = createServer(nextRequestHandler);

  return await listen(server);
}
