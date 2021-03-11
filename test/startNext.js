'use strict';

const { createServer } = require('http');
const listen = require('./listen');

/**
 * Starts Next.js.
 * @kind function
 * @name startNext
 * @param {string} [dir] Next.js project directory path.
 * @returns {Promise<{port: string, close: Function}>} Resolves the port the Next.js server is listening on, and a function to close the Next.js server.
 * @ignore
 */
module.exports = async function startNext(dir) {
  const next = require(require.resolve('next', { paths: [dir] }));
  const app = next({ dir, customServer: false });

  await app.prepare();

  const server = createServer(app.getRequestHandler());

  return listen(server);
};
