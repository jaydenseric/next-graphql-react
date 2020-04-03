/**
 * A higher-order function to decorate a Next.js custom config in
 * `next.config.js` for [`graphql-react`](https://npm.im/graphql-react), that
 * excludes server only `graphql-react/server` and
 * `next-graphql-react/server/LinkHeader` imports from the client bundle.
 * @see [Next.js custom config docs](https://nextjs.org/docs/#custom-configuration).
 * @see [`graphql-react` `ssr` docs](https://github.com/jaydenseric/graphql-react#function-ssr).
 * @kind function
 * @name withGraphQLConfig
 * @param {object} config Next.js custom config.
 * @returns {object} Next.js custom config.
 * @example <caption>A custom config.</caption>
 * In `next.config.js`:
 *
 * ```js
 * const { withGraphQLConfig } = require('next-graphql-react/server')
 *
 * module.exports = withGraphQLConfig({
 *   // Custom config…
 * })
 * ```
 */
export const withGraphQLConfig = ({
  webpack = (config) => config,
  ...config
} = {}) => ({
  ...config,
  webpack(config, options) {
    if (!options.isServer) {
      config.resolve.alias['graphql-react/server$'] =
        '../universal/decoys/graphql-react';
      config.resolve.alias['next-graphql-react/server/LinkHeader$'] =
        '../universal/decoys/LinkHeader';
    }

    return webpack(config, options);
  },
});
