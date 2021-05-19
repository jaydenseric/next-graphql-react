import { createServer } from 'http';
import { createRequire } from 'module';
import listen from './listen.mjs';

const require = createRequire(import.meta.url);

/**
 * Starts Next.js.
 * @kind function
 * @name startNext
 * @param {string} [dir] Next.js project directory path.
 * @returns {Promise<{port: string, close: Function}>} Resolves the port the Next.js server is listening on, and a function to close the Next.js server.
 * @ignore
 */
export default async function startNext(dir) {
  const next = require(require.resolve('next', { paths: [dir] }));
  const app = next({ dir, customServer: false });

  await app.prepare();

  const server = createServer(app.getRequestHandler());

  return listen(server);
}
