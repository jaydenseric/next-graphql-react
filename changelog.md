# next-graphql-react changelog

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
