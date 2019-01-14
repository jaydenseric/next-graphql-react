# next-graphql-react changelog

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
