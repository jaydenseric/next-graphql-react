import execFilePromise from "./execFilePromise.mjs";

/**
 * Removes a file or directory.
 * @kind function
 * @name fsPathRemove
 * @param {string} path Filesystem path.
 * @returns {Promise<void>} Resolves once the file or directory is removed.
 * @ignore
 */
export default async function fsPathRemove(path) {
  if (typeof path !== "string")
    throw new TypeError("Argument 1 `path` must be a string.");

  await execFilePromise("rm", ["-rf", path]);
}
