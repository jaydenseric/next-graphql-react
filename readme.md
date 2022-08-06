![graphql-react logo](https://cdn.jsdelivr.net/gh/jaydenseric/graphql-react@0.1.0/graphql-react-logo.svg)

# next-graphql-react

[![npm version](https://badgen.net/npm/v/next-graphql-react)](https://npm.im/next-graphql-react) [![CI status](https://github.com/jaydenseric/next-graphql-react/workflows/CI/badge.svg)](https://github.com/jaydenseric/next-graphql-react/actions)

A [`graphql-react`](https://npm.im/graphql-react) integration for [Next.js](https://nextjs.org).

## Installation

To install [`next-graphql-react`](https://npm.im/next-graphql-react) and its [`graphql-react`](https://npm.im/graphql-react) peer dependency with [npm](https://npmjs.com/get-npm), run:

```sh
npm install next-graphql-react graphql-react
```

Within `pages/_app.js`:

1. Polyfill the [required globals](https://github.com/jaydenseric/graphql-react#requirements).
2. Use the [`withGraphQLReact`](./withGraphQLReact.mjs) decorator to setup a [Next.js custom `App`](https://nextjs.org/docs/advanced-features/custom-app).

Then the [`graphql-react`](https://npm.im/graphql-react) [React](https://reactjs.org) hooks can be used within your [Next.js](https://nextjs.org) pages and components.

## Requirements

- [Node.js](https://nodejs.org): `^14.17.0 || ^16.0.0 || >= 18.0.0`
- [Browsers](https://npm.im/browserslist): `> 0.5%, not OperaMini all, not dead`

## Exports

These ECMAScript modules are published to [npm](https://npmjs.com) and exported via the [`package.json`](./package.json) `exports` field:

- [`withGraphQLReact.mjs`](./withGraphQLReact.mjs)
