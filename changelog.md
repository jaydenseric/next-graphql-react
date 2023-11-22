# next-graphql-react changelog

## Next

### Major

- Updated Node.js support to `^18.17.0 || >=20.4.0`.
- Updated dev dependencies, some of which require newer Node.js versions than previously supported.
- Use the Node.js test runner API and remove the dev dependency [`test-director`](https://npm.im/test-director).
- Refactored tests to no longer polyfill the standard `AbortController`, `AbortSignal`, `Event`, `EventTarget`, and `performance` APIs available in modern Node.js and removed the dev dependencies [`abort-controller`](https://npm.im/abort-controller) and [`event-target-shim`](https://npm.im/event-target-shim).

### Patch

- Updated the [`next`](https://npm.im/next) peer dependency to `12 - 14`, fixing [#7](https://github.com/jaydenseric/next-graphql-react/issues/7).
- Updated dependencies.
- Updated the `package.json` field `repository` to conform to new npm requirements.
- Integrated the ESLint plugin [`eslint-plugin-optimal-modules`](https://npm.im/eslint-plugin-optimal-modules).
- Updated GitHub Actions CI config:
  - The workflow still triggers on push, but no longer on pull request.
  - The workflow can now be manually triggered.
  - Run tests with Node.js v18, v20, v21.
  - Updated `actions/checkout` to v4.
  - Updated `actions/setup-node` to v4.
- Improved the types for test fixture Next.js config.
- For the function `withGraphQLReact` tests:
  - Temporarily disabled the tests for Node.js v18 due to the Node.js test runner bug [nodejs/node#48845](https://github.com/nodejs/node/issues/48845) that will be fixed in a future Node.js v18 release.
  - Use the new Puppeteer headless mode.
  - For the client side page load test:
    - Attempt to wait until the JS has loaded and the React app has mounted before clicking the navigation link.
    - Simulate fast 3G network conditions to ensure GraphQL query loading state can render and be asserted.
  - Migrated use of the deprecated Next.js CLI `next export` to the new Next.js static export API.
  - Removed an apparently no longer necessary workaround that forced the process to exit after tests; older Next.js used to stay running after closing it’s server.
- Fixed bugs in the test helper function `startNext`.

## 15.0.2

### Patch

- Use a new internal helper function `cjsDefaultImport` to normalize the default import value from the CJS module `next/app.js` that has a `default` property, preserving the type for the various ways TypeScript may be configured.

## 15.0.1

### Patch

- Updated the [`next`](https://npm.im/next) peer dependency to `12 - 13`.
- Updated dev dependencies.
- Fixed a link in the v14.0.0 changelog entry.

## 15.0.0

### Major

- Updated the [`graphql-react`](https://npm.im/graphql-react) peer dependency to `^20.0.0`.
- Updated the [`react-waterfall-render`](https://npm.im/react-waterfall-render) dependency to v5.

### Patch

- Updated dev dependencies.
- Use the `node:` URL scheme for Node.js builtin module imports in tests.
- Migrated from the Node.js builtin module `fs` to `node:fs/promises` in tests.
- Replaced the test helper function `fsPathRemove` with the function `rm` from the Node.js builtin module `node:fs/promises`.
- Tweaked the readme.

## 14.0.0

### Major

- Updated the [`graphql-react`](https://npm.im/graphql-react) peer dependency to `^19.0.0`.
- Updated the [`react`](https://npm.im/react) and [`react-dom`](https://npm.im/react-dom) peer dependencies to `^18.0.0`.
- Updated `react-dom/server` imports to suit React v18.

### Patch

- Updated dependencies.
- Removed the now redundant `not IE > 0` from the Browserslist query.
- Use the TypeScript type for Next.js config in test fixtures.
- Revamped the readme:
  - Removed the badges.
  - Better installation instructions that don’t assume the Next.js custom app module has a `.js` file extension.
  - Added information about TypeScript config and [optimal JavaScript module design](https://jaydenseric.com/blog/optimal-javascript-module-design).

## 13.0.0

### Major

- Updated Node.js support to `^14.17.0 || ^16.0.0 || >= 18.0.0`.
- Updated the [`graphql-react`](https://npm.im/graphql-react) peer dependency to `^18.0.0`.
- Updated dependencies.
- Implemented TypeScript types via JSDoc comments.

### Patch

- Simplified dev dependencies and config for ESLint.
- Removed the [`jsdoc-md`](https://npm.im/jsdoc-md) dev dependency and the package `docs-update` and `docs-check` scripts, replacing the readme “API” section with a manually written “Exports” section.
- Check TypeScript types via a new package `types` script.
- Support Next.js page response `Link` header array values.
- Use `React.createElement` instead of the [the new React JSX runtime](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) in tests.
- Updated GitHub Actions CI config:
  - Run tests with Node.js v14, v16, v18.
  - Updated `actions/checkout` to v3.
  - Updated `actions/setup-node` to v3.
- Use the `.mjs` file extension for Next.js pages in test fixtures.
- Removed the readme section “Examples”.
- Fixed a readme typo.
- Added a `license.md` MIT License file.

## 12.0.0

### Major

- Updated Node.js support to `^12.22.0 || ^14.17.0 || >= 16.0.0`.
- Updated the [`graphql-react`](https://npm.im/graphql-react) peer dependency to `^16.0.0`.
- Updated the [`next`](https://npm.im/next) peer dependency to `^12.0.0`.
- Updated dependencies, some of which require newer Node.js versions than previously supported.
- Public modules are now individually listed in the package `files` and `exports` fields.
- Removed `./package` from the package `exports` field; the full `package.json` filename must be used in a `require` path.
- Removed the package main index module; deep imports must be used.
- Shortened public module deep import paths, removing the `/public/`.
- The API is now ESM in `.mjs` files instead of CJS in `.js` files, [accessible via `import` but not `require`](https://nodejs.org/dist/latest/docs/api/esm.html#require).
- Switched back to using `React.createElement` instead of the [the new React JSX runtime](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html).

### Patch

- Also run GitHub Actions CI with Node.js v17.
- Removed the redundant [`graphql`](https://npm.im/graphql) dev dependency.
- Simplified package scripts.
- Reorganized the test file structure.
- Workaround Next.js not gracefully closing in tests.
- Removed a redundant prepare step that’s a no-op in current Next.js versions when programmatically starting Next.js in tests.
- Fixed an internal JSDoc type.
- Configured Prettier option `singleQuote` to the default, `false`.

## 11.0.0

### Major

- Updated the [`next`](https://npm.im/next) peer dependency to `9.5 - 11`.
- Removed `Head.rewind()` within the function `withGraphQLReact`, as it was made a noop in Next.js v9.5 and was removed in Next.js v11.

### Patch

- Updated dev dependencies.
- Added the [`eslint-config-next`](https://npm.im/eslint-config-next) dev dependency for [`next`](https://npm.im/next) v11.

## 10.0.1

### Patch

- Updated the [`graphql-react`](https://npm.im/graphql-react) peer dependency to `14 - 15`.
- Updated dev dependencies.
- Renamed imports in the test index module.
- Use improved static fixtures instead of creating fixtures each test run, removing the [`disposable-directory`](https://npm.im/disposable-directory) and [`install-from`](https://npm.im/install-from) dev dependencies.
- Use the `NEXT_TELEMETRY_DISABLED` environment variable to disable Next.js telemetry for tests.
- Amended the changelog entries for v3.0.1, v3.0.2, v7.0.0, v8.0.1, v9.0.0, and v10.0.0.
- Documentation tweaks.

## 10.0.0

### Major

- Updated Node.js support to `^12.20 || >= 14.13`.
- Updated the [`graphql-react`](https://npm.im/graphql-react) peer dependency to `^14.0.0`.
- Updated dependencies, some of which require newer Node.js versions than were previously supported.
- Replaced the the `package.json` `exports` field public [subpath folder mapping](https://nodejs.org/api/packages.html#packages_subpath_folder_mappings) (deprecated by Node.js) with a [subpath pattern](https://nodejs.org/api/packages.html#packages_subpath_patterns). Deep `require` paths within `next-graphql-react/public/` must now include the `.js` file extension.
- The tests are now ESM in `.mjs` files instead of CJS in `.js` files.

### Minor

- Added a package `sideEffects` field.

### Patch

- Updated GitHub Actions CI config to run tests with Node.js v12, v14, v16.
- Simplified JSDoc related package scripts now that [`jsdoc-md`](https://npm.im/jsdoc-md) v10+ automatically generates a Prettier formatted readme.
- Added a package `test:jsdoc` script that checks the readme API docs are up to date with the source JSDoc.
- Use the `.js` file extension in internal `require` paths.
- Updated the [example Next.js app](https://graphql-react.vercel.app) URL in the readme.
- Documentation tweaks.
- The file `changelog.md` is no longer published.

## 9.0.0

### Major

- Updated Node.js support to `^12.0.0 || >= 13.7.0`.
- Stopped supporting Internet Explorer.
- Updated the [`graphql-react`](https://npm.im/graphql-react) peer dependency to `^13.0.0`.
- Updated the [`react`](https://npm.im/react) peer dependency to `16.14 - 17`.
- Use [the new React JSX runtime](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html).
- Reorganized file structure. Deep import paths beginning with `next-graphql-react/universal` must be updated to `next-graphql-react/public`.
- The `withGraphQLApp` higher order function has changed:
  - It’s been renamed `withGraphQLReact`.
  - It now automatically sets the context required for the new [`graphql-react`](https://npm.im/graphql-react) v13 API.
  - It now uses `async`/`await` instead of `Promise` chains.
  - The React class component it returns has been refactored to a functional component using React hooks.
- Published modules now contain JSDoc comments, which might affect TypeScript projects.

### Minor

- Allow React component `displayName` to be removed in production builds.

### Patch

- Updated dev dependencies.
- Removed the redundant [`object-assign`](https://npm.im/object-assign) dependency.
- Removed Babel and related dependencies and config.
- Refactored experimental syntax to what is supported for the Browserslist query.
- Restructured tests to mirror the published file structure.
- Updated the package description.
- Updated a Next.js docs link URL.
- Internal JSDoc tweaks.
- Readme edits, including:
  - Updated the “Setup” section.
  - Updated the “Support” section.

## 8.0.4

### Patch

- Updated dependencies.
- Removed redundant dev dependencies.
- Stop using [`hard-rejection`](https://npm.im/hard-rejection) to detect unhandled `Promise` rejections in tests, as Node.js v15+ does this natively.
- Tweaked the v8.0.3 changelog entry.
- Always use regex `u` mode.
- Use the Next.js JS API instead of the CLI to start Next.js in tests, fixing Next.js start detection in tests broken since Next.js v10.0.6-canary.8.
- Asynchronously create test fixture files.
- Fixed incorrect console output indentation following certain test failures.
- Added tests for SSR GraphQL response `Link` header forwarding to the client.
- Fixed errors that can happen during a Next.js build or SSR due to unparsable `Link` headers.
- Internal JSDoc tweaks.
- Updated GitHub Actions CI config:
  - Updated `actions/checkout` to v2.
  - Updated `actions/setup-node` to v2.
  - Don’t specify the `CI` environment variable as it’s set by default.

## 8.0.3

### Patch

- Updated the [`next`](https://npm.im/next) peer dependency to `9.0.3 - 10`.
- Updated the [`react`](https://npm.im/react) peer dependency to `16.8 - 17`.
- Updated dependencies.
- Moved [`disposable-directory`](https://npm.im/disposable-directory) to dev dependencies.
- Also run GitHub Actions with Node.js v15.
- Fixed a test hanging in Node.js v15.

## 8.0.2

### Patch

- Updated dependencies.
- Updated the [`graphql-react`](https://npm.im/graphql-react) peer dependency to `11 - 12`.

## 8.0.1

### Patch

- Updated dependencies.
- Derive fixture dependency versions from dev dependency versions.
- No longer separately build ESM and CJS to simplify package scripts, Babel and ESLint config.
- Use `require` instead of dynamic `import` in `withGraphQLApp` source, as since v7.0.0 the module is only published as CJS.
- Removed unnecessary `.js` file extensions from `require` paths.
- Simplified the GitHub Actions CI config with the [`npm install-test`](https://docs.npmjs.com/cli/v7/commands/npm-install-test) command.
- Clearly documented ways to `import` and `require` the package exports.
- Removed `npm-debug.log` from the `.gitignore` file as npm [v4.2.0](https://github.com/npm/npm/releases/tag/v4.2.0)+ doesn’t create it in the current working directory.

## 8.0.0

### Major

- Updated supported Node.js versions to `^10.17.0 || ^12.0.0 || >= 13.7.0`.
- Added integration tests. These use modern Node.js APIs, increasing the minimum supported Node.js version.

### Patch

- Updated dependencies.
- Stop testing with Node.js v13.
- Added missing file extensions to dynamic imports from Next.js.
- Removed documentation relating to polyfilling `Promise` and `fetch`, as they are automatically polyfilled by recent versions of Next.js.
- Updated the `.editorconfig` file.

## 7.0.1

### Patch

- Corrected the package description to match the current API.
- Updated JSDoc code examples:
  - Prettier formatting.
  - Import React in examples containing JSX.

## 7.0.0

### Major

- Added a package [`exports`](https://nodejs.org/api/packages.html#packages_exports) field to support native ESM in Node.js.
- Some source and published files are now `.js` (CJS) instead of `.mjs` (ESM), so undocumented deep imports may no longer work. [This approach avoids the dual package hazard](https://nodejs.org/api/packages.html#packages_approach_1_use_an_es_module_wrapper).
- Updated Node.js support from v10+ to `10 - 12 || >= 13.7` to reflect the package `exports` related breaking changes.
- Updated the [`graphql-react`](https://npm.im/graphql-react) peer dependency to `^11.0.0`.
- Removed `withGraphQLConfig`; `withGraphQLApp` now uses dynamic `import` to only load certain dependencies in a server environment.

### Patch

- Updated dependencies.
- Removed the [`@babel/plugin-proposal-object-rest-spread`](https://npm.im/@babel/plugin-proposal-object-rest-spread) and [`babel-plugin-transform-replace-object-assign`](https://npm.im/babel-plugin-transform-replace-object-assign) dev dependencies and simplified Babel config.
- Improved the package `prepare:prettier` and `test:prettier` scripts.
- Reordered the package `test:eslint` script args for consistency with `test:prettier`.
- Configured Prettier option `semi` to the default, `true`.
- Lint fixes for [`prettier`](https://npm.im/prettier) v2.
- Reorder Babel config fields.
- Ensure GitHub Actions run on pull request.
- Also run GitHub Actions with Node.js v14.
- Support Next.js static HTML export, fixing [#4](https://github.com/jaydenseric/next-graphql-react/issues/4).

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
- Use `cjs` instead of `commonjs` for the [`@babel/preset-env`](https://npm.im/@babel/preset-env) `modules` option.
- Use `>=` in the Browserslist `node` queries.

## 3.0.1

### Patch

- Updated dependencies.
- Updated examples for [`graphql-react`](https://npm.im/graphql-react) v8.2.0.

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
