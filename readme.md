![graphql-react logo](https://cdn.jsdelivr.net/gh/jaydenseric/graphql-react@0.1.0/graphql-react-logo.svg)

# next-graphql-react

[![npm version](https://badgen.net/npm/v/next-graphql-react)](https://npm.im/next-graphql-react) [![Build status](https://travis-ci.org/jaydenseric/next-graphql-react.svg?branch=master)](https://travis-ci.org/jaydenseric/next-graphql-react)

[Next.js](https://nextjs.org) [config](https://nextjs.org/docs/#custom-configuration) and [`App`](https://nextjs.org/docs/#custom-app) decorators for [`graphql-react`](https://npm.im/graphql-react), enabling server side rendered GraphQL operations.

## Setup

To install [`next-graphql-react`](https://npm.im/next-graphql-react) and the [`graphql-react`](https://npm.im/graphql-react) peer dependency from [npm](https://npmjs.com) run:

```sh
npm install next-graphql-react graphql-react
```

See the [`withGraphQLConfig`](#function-withgraphqlconfig) and [`withGraphQLApp`](#function-withgraphqlapp) examples to get started.

## Support

- Node.js v8.5+
- Browsers [`> 0.5%, not dead`](https://browserl.ist/?q=%3E+0.5%25%2C+not+dead)

Consider polyfilling:

- [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API)

## API

### Table of contents

- [function withGraphQLApp](#function-withgraphqlapp)
  - [See](#see)
  - [Examples](#examples)
- [function withGraphQLConfig](#function-withgraphqlconfig)
  - [See](#see-1)
  - [Examples](#examples-1)

### function withGraphQLApp

A higher-order React component to decorate a Next.js custom `App` component in `pages/_app.js` for [`graphql-react`](https://npm.im/graphql-react), enabling descendant GraphQL operations with server side rendering and client side data hydration.

It also forwards HTTP [`Link`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link) headers with the following `rel` parameters from GraphQL responses received when [`ssr`](https://github.com/jaydenseric/graphql-react#function-ssr) runs to the Next.js page response:

- [`dns-prefetch`](https://html.spec.whatwg.org/dev/links.html#link-type-dns-prefetch)
- [`preconnect`](https://html.spec.whatwg.org/dev/links.html#link-type-preconnect)
- [`prefetch`](https://html.spec.whatwg.org/dev/links.html#link-type-prefetch)
- [`preload`](https://html.spec.whatwg.org/dev/links.html#link-type-preload)
- [`modulepreload`](https://html.spec.whatwg.org/dev/links.html#link-type-modulepreload)
- [`prerender`](https://html.spec.whatwg.org/dev/links.html#link-type-prerender)

Link URLs are forwarded unmodified, so avoid sending relative URLs from a GraphQL server hosted on a different domain to the app.

| Parameter | Type   | Description                     |
| :-------- | :----- | :------------------------------ |
| `App`     | object | Next.js custom `App` component. |

**Returns:** WithGraphQL — Next.js custom `App` higher-order component.

#### See

- [Next.js custom `App` docs](https://nextjs.org/docs#custom-app).
- [React higher-order component docs](https://reactjs.org/docs/higher-order-components).

#### Examples

_A custom `App`._

> In `pages/_app.js`:
>
> ```js
> import 'cross-fetch/polyfill'
> import { GraphQLProvider } from 'graphql-react'
> import { withGraphQLApp } from 'next-graphql-react'
> import App, { Container } from 'next/app'
>
> class CustomApp extends App {
>   render() {
>     const { Component, pageProps, graphql } = this.props
>     return (
>       <Container>
>         <GraphQLProvider graphql={graphql}>
>           <Component {...pageProps} />
>         </GraphQLProvider>
>       </Container>
>     )
>   }
> }
>
> export default withGraphQLApp(CustomApp)
> ```

---

### function withGraphQLConfig

A higher-order function to decorate a Next.js custom config in `next.config.js` for [`graphql-react`](https://npm.im/graphql-react), that excludes server only `graphql-react/server` and `next-graphql-react/server/LinkHeader` imports from the client bundle.

| Parameter | Type   | Description            |
| :-------- | :----- | :--------------------- |
| `config`  | object | Next.js custom config. |

**Returns:** object — Next.js custom config.

#### See

- [Next.js custom config docs](https://nextjs.org/docs/#custom-configuration).
- [`graphql-react` `ssr` docs](https://github.com/jaydenseric/graphql-react#function-ssr).

#### Examples

_A custom config._

> In `next.config.js`:
>
> ```js
> const { withGraphQLConfig } = require('next-graphql-react/server')
>
> module.exports = withGraphQLConfig({
>   // Custom config…
> })
> ```
