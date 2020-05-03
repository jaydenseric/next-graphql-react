# next-graphql-react changelog

## Next

### Major

- Added a [package `exports` field](https://nodejs.org/api/esm.html#esm_package_exports) to support native ESM in Node.js.
- Some source and published files are now `.js` (CJS) instead of `.mjs` (ESM), so undocumented deep imports may no longer work. [This approach avoids the dual package hazard](https://nodejs.org/api/esm.html#esm_approach_1_use_an_es_module_wrapper).
- Updated Node.js support from v10+ to `10 - 12 || >= 13.7` to reflect the package `exports` related breaking changes.
- Removed `withGraphQLConfig`; `withGraphQLApp` now uses dynamic `import` to only load certain dependencies in a server environment.

### Patch

- Updated dependencies.
- Updated the [`graphql-react`](https://npm.im/graphql-react) peer dependency to `8.3.0 - 10`.
- Removed the [`@babel/plugin-proposal-object-rest-spread`](https://npm.im/@babel/plugin-proposal-object-rest-spread) and [`babel-plugin-transform-replace-object-assign`](https://npm.im/babel-plugin-transform-replace-object-assign) dev dependencies and simplified Babel config.
- Improved the package `prepare:prettier` and `test:prettier` scripts.
- Reordered the package `test:eslint` script args for consistency with `test:prettier`.
- Configured Prettier option `semi` to the default, `true`.
- Lint fixes for [`prettier`](https://npm.im/prettier) v2.
- Reorder Babel config fields.
- Ensure GitHub Actions run on pull request.
- Also run GitHub Actions with Node.js v14.

## 6.0.1

### Patch

- Updated dev dependencies.
- Fixed a bug relating to ESM/CJS interoperability and default imports.

## 6.0.0

### Major

- Updated Node.js support from v8.10+ to v10+.
- Updated dev dependencies, some of which now require Node.js v10+.

### Patch

- Updated dependencies.
- Removed the now redundant [`eslint-plugin-import-order-alphabetical`](https://npm.im/eslint-plugin-import-order-alphabetical) dev dependency.
- Stop using [`husky`](https://npm.im/husky) and [`lint-staged`](https://npm.im/lint-staged).
- Use strict mode for scripts.
- Fixed page `getInitialProps` not working when `withGraphQLApp` decorates an app that doesn’t have `getInitialProps`.

## 5.1.0

### Minor

- Setup [GitHub Sponsors funding](https://github.com/sponsors/jaydenseric):
  - Added `.github/funding.yml` to display a sponsor button in GitHub.
  - Added a `package.json` `funding` field to enable npm CLI funding features.

### Patch

- Updated dev dependencies.

## 5.0.0

### Major

- Updated Node.js support from v8.5+ to v8.10+, to match what the [`eslint`](https://npm.im/eslint) dev dependency now supports. This is unlikely to be a breaking change for the published package.

### Patch

- Updated dev dependencies.
- Updated the [`graphql-react`](https://npm.im/graphql-react) peer dependency to `8.3.0 - 9`.
- Clarified that Opera Mini isn’t supported in the Browserslist queries and readme “Support” section.
- Use GitHub Actions instead of Travis for CI.
- Removed `package-lock.json` from `.gitignore` and `.prettierignore` as it’s disabled in `.npmrc` anyway.
- Updated the `withGraphQLApp` example code for the current Next.js API, and mark it as JSX instead of JS for syntax highlighting.
- Added a readme “Examples” section.

## 4.0.0

### Major

- Updated the [`next`](https://npm.im/next) peer dependency to `^9.0.3`.
- Use the new `AppTree` component available in [`next` v9.0.3](https://github.com/zeit/next.js/releases/tag/v9.0.3) in the `App.getInitialProps` static method `context` argument, with the `ssr` function in `withGraphQLApp`. This allows the use of Next.js React hook based APIs such as `useRouter` that previously had undefined context values in SSR (see [zeit/next.js#6042](https://github.com/zeit/next.js/issues/6042)).

### Patch

- Updated dependencies.
- Cleaner readme “API” section table of contents with “See” and “Examples” headings excluded, thanks to [`jsdoc-md` v3.1.0](https://github.com/jaydenseric/jsdoc-md/releases/tag/v3.1.0).
- Removed a now redundant ESLint disable `no-console` comment in `withGraphQLApp`.

## 3.2.0

### Minor

- In addition to `preload`, HTTP `Link` headers from GraphQL responses during SSR with the following `rel` parameters are forwarded in the Next.js page response:
  - `dns-prefetch`
  - `preconnect`
  - `prefetch`
  - `modulepreload`
  - `prerender`

### Patch

- Updated dev dependencies.
- Minor variable rename for clarity.

## 3.1.1

### Patch

- Fixed edge case HTTP `Link` header parsing bugs (e.g. an error when a URL contains `,`) by replacing the `filterLinkHeader` and `mergeLinkHeaders` functions with [`http-link-header`](https://npm.im/http-link-header).
- Fixed `withGraphQLConfig` documentation.
- Documented the HTTP `Link` `rel="preload"` header forwarding behavior of `withGraphQLApp`.

## 3.1.0

### Minor

- Updated the [`next`](https://npm.im/next) peer dependency to `7 - 9`.
- HTTP `Link` headers with `rel=preload` from GraphQL responses are now merged with the Next.js page response `Link` header (if present), allowing assets to be preloaded from GraphQL queries.

### Patch

- Updated dependencies.
- New `src/universal/decoys` directory structure for decoy server files.

## 3.0.2

### Patch

- Updated dependencies.
- Reduced the size of the published `package.json` by moving dev tool config to files. This also prevents editor extensions such as Prettier and ESLint from detecting config and attempting to operate when opening package files installed in `node_modules`.
- Use `cjs` instead of `commonjs` for the [`@babel/preset-env`](https:npm.im/@babel/preset-env) `modules` option.
- Use `>=` in the Browserslist `node` queries.

## 3.0.1

### Patch

- Updated dependencies.
- Updated examples for [`graphql-react`](https:npm.im/graphql-react) v8.2.0.

## 3.0.0

### Major

- Updated the [`graphql-react`](https://npm.im/graphql-react) peer dependency to `^8.0.0`, and updated the implementation for the new API.
- Updated the [`react`](https://npm.im/react) peer dependency to `^16.8.0`.

### Minor

- Updated the [`next`](https://npm.im/next) peer dependency to `7 - 8`.

### Patch

- Updated dev dependencies.
- Simplified the `prepublishOnly` script.
- Updated docs for the new [`graphql-react`](https://npm.im/graphql-react) API.

## 2.0.0

### Major

- Updated the [`graphql-react`](https://npm.im/graphql-react) peer dependency to `^7.0.0`.
- Renamed `withGraphQL` to `withGraphQLApp`.
- Added `withGraphQLConfig`, a Next.js custom config decorator that excludes server only `graphql-react/lib/ssr` imports from the client bundle.

### Patch

- Updated dependencies.
- New package description.
- New project structure so server only and universal modules can have different Babel and Browserslist config.

## 1.0.2

### Patch

- Updated dev dependencies.
- Catch and `console.log` GraphQL `preload` render errors.

## 1.0.1

### Patch

- Fixed GraphQL cache clearing on route changes.
- Fixed incorrect `getInitialProps` implementation.
- Higher-order component display name better follows [React conventions](https://reactjs.org/docs/higher-order-components#convention-wrap-the-display-name-for-easy-debugging):
  - Uppercase first letter.
  - Decorated component name falls back to `Component` instead of `Unknown`.
- Renamed `cache` prop to `graphqlCache`.
- Improved JSDoc.

## 1.0.0

Initial release.
