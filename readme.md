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
2. Use the [`withGraphQLReact`](#function-withgraphqlreact) decorator to setup a [Next.js custom `App`](https://nextjs.org/docs/advanced-features/custom-app).

Then the [`graphql-react`](https://npm.im/graphql-react) [React](https://reactjs.org) hooks can be used within your [Next.js](https://nextjs.org) pages and components.

## Examples

- [Next.js example](https://github.com/jaydenseric/graphql-react-examples) deployed at [graphql-react.vercel.app](https://graphql-react.vercel.app).
- [Official Next.js example](https://github.com/zeit/next.js/tree/canary/examples/with-graphql-react) (often outdated as the Next.js team can be extremely slow to review and merge merge pull requests).

## Requirements

- [Node.js](https://nodejs.org): `^12.22.0 || ^14.17.0 || >= 16.0.0`
- [Browsers](https://npm.im/browserslist): `> 0.5%, not OperaMini all, not IE > 0, not dead`

## API

### function withGraphQLReact

A [Next.js](https://nextjs.org) custom `App` [React](https://reactjs.org) component decorator that returns a higher-order [React](https://reactjs.org) component that enables the [`graphql-react`](https://npm.im/graphql-react) [React](https://reactjs.org) hooks within children for loading and caching data that can be server side rendered and hydrated on the client.

After [waterfall rendering](https://github.com/jaydenseric/react-waterfall-render) for a server side render, cache values are scanned for a `response` property (which should be non-enumerable so it won’t be included in the serialized JSON sent to the client for hydration) that is a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) instance. Any of the following HTTP [`Link`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link) headers found in the responses are deduped and forwarded to the client in the [Next.js](https://nextjs.org) page response:

- [`dns-prefetch`](https://html.spec.whatwg.org/dev/links.html#link-type-dns-prefetch)
- [`preconnect`](https://html.spec.whatwg.org/dev/links.html#link-type-preconnect)
- [`prefetch`](https://html.spec.whatwg.org/dev/links.html#link-type-prefetch)
- [`preload`](https://html.spec.whatwg.org/dev/links.html#link-type-preload)
- [`modulepreload`](https://html.spec.whatwg.org/dev/links.html#link-type-modulepreload)
- [`prerender`](https://html.spec.whatwg.org/dev/links.html#link-type-prerender)

Link URLs are forwarded unmodified, so avoid sending relative URLs from a [GraphQL](https://graphql.org) server hosted on a different domain to the app.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `App` | object | [Next.js](https://nextjs.org) custom `App` [React](https://reactjs.org) component. |

**Returns:** withGraphQLReact\~WithGraphQLReact — [Next.js](https://nextjs.org) custom `App` higher-order [React](https://reactjs.org) component.

#### See

- [Next.js custom `App` docs](https://nextjs.org/docs/advanced-features/custom-app).
- [React higher-order component docs](https://reactjs.org/docs/higher-order-components).

#### Examples

_How to import._

> ```js
> import withGraphQLReact from "next-graphql-react/withGraphQLReact.mjs";
> ```

_A [Next.js](https://nextjs.org) custom `App`._

> In `pages/_app.js`:
>
> ```jsx
> import withGraphQLReact from "next-graphql-react/withGraphQLReact.mjs";
> import App from "next/app";
>
> export default withGraphQLReact(App);
> ```
