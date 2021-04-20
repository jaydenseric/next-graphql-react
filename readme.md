![graphql-react logo](https://cdn.jsdelivr.net/gh/jaydenseric/graphql-react@0.1.0/graphql-react-logo.svg)

# next-graphql-react

[![npm version](https://badgen.net/npm/v/next-graphql-react)](https://npm.im/next-graphql-react) [![CI status](https://github.com/jaydenseric/next-graphql-react/workflows/CI/badge.svg)](https://github.com/jaydenseric/next-graphql-react/actions)

A [`graphql-react`](https://npm.im/graphql-react) integration for [Next.js](https://nextjs.org).

## Setup

To install [`next-graphql-react`](https://npm.im/next-graphql-react) and the [`graphql-react`](https://npm.im/graphql-react) peer dependency from [npm](https://npmjs.com) run:

```sh
npm install next-graphql-react graphql-react
```

See the [`withGraphQLReact`](#function-withgraphqlreact) examples to get started.

## Examples

- [Official Next.js example](https://github.com/zeit/next.js/tree/canary/examples/with-graphql-react).
- [Next.js example](https://github.com/jaydenseric/graphql-react-examples) deployed at [graphql-react.now.sh](https://graphql-react.now.sh).

## Support

- [Node.js](https://nodejs.org): `^12.0.0 || >= 13.7.0`
- [Browsers](https://npm.im/browserslist): `> 0.5%, not OperaMini all, not IE > 0, not dead`

## API

### Table of contents

- [function withGraphQLReact](#function-withgraphqlreact)

### function withGraphQLReact

A Next.js custom `App` React component decorator that returns a higher-order React component that enables the [`graphql-react`](https://npm.im/graphql-react) React hooks within children for loading and caching data that can be server side rendered and hydrated on the client.

After [waterfall rendering](https://github.com/jaydenseric/react-waterfall-render) for a server side render, cache values are scanned for a `response` property (which should be non-enumerable so it won’t be included in the serialized JSON sent to the client for hydration) that is a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) instance. Any of the following HTTP [`Link`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link) headers found in the responses are deduped and forwarded to the client in the Next.js page response:

- [`dns-prefetch`](https://html.spec.whatwg.org/dev/links.html#link-type-dns-prefetch)
- [`preconnect`](https://html.spec.whatwg.org/dev/links.html#link-type-preconnect)
- [`prefetch`](https://html.spec.whatwg.org/dev/links.html#link-type-prefetch)
- [`preload`](https://html.spec.whatwg.org/dev/links.html#link-type-preload)
- [`modulepreload`](https://html.spec.whatwg.org/dev/links.html#link-type-modulepreload)
- [`prerender`](https://html.spec.whatwg.org/dev/links.html#link-type-prerender)

Link URLs are forwarded unmodified, so avoid sending relative URLs from a GraphQL server hosted on a different domain to the app.

| Parameter | Type   | Description                           |
| :-------- | :----- | :------------------------------------ |
| `App`     | object | Next.js custom `App` React component. |

**Returns:** withGraphQLReact\~WithGraphQLReact — Next.js custom `App` higher-order React component.

#### See

- [Next.js custom `App` docs](https://nextjs.org/docs/advanced-features/custom-app).
- [React higher-order component docs](https://reactjs.org/docs/higher-order-components).

#### Examples

_Ways to `import`._

> ```js
> import { withGraphQLReact } from 'next-graphql-react';
> ```
>
> ```js
> import withGraphQLReact from 'next-graphql-react/public/withGraphQLReact.js';
> ```

_Ways to `require`._

> ```js
> const { withGraphQLReact } = require('next-graphql-react');
> ```
>
> ```js
> const withGraphQLReact = require('next-graphql-react/public/withGraphQLReact');
> ```

_A Next.js custom `App`._

> In `pages/_app.js`:
>
> ```jsx
> import withGraphQLReact from 'next-graphql-react/public/withGraphQLReact.js';
> import App from 'next/app';
>
> export default withGraphQLReact(App);
> ```
