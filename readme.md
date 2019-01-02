![graphql-react logo](https://cdn.jsdelivr.net/gh/jaydenseric/graphql-react@0.1.0/graphql-react-logo.svg)

# next-graphql-react

[![npm version](https://badgen.net/npm/v/next-graphql-react)](https://npm.im/next-graphql-react) [![Build status](https://travis-ci.org/jaydenseric/next-graphql-react.svg?branch=master)](https://travis-ci.org/jaydenseric/next-graphql-react)

A [React higher-order component](https://reactjs.org/docs/higher-order-components) to decorate a [Next.js](https://nextjs.org) [`pages/_app.js` custom `App` component](https://github.com/zeit/next.js#custom-app) for [`graphql-react`](https://npm.im/graphql-react), enabling descendant GraphQL queries with server side rendering and client side data hydration.

## Setup

To install [`next-graphql-react`](https://npm.im/next-graphql-react) and the [`graphql-react`](https://npm.im/graphql-react) peer dependency from [npm](https://npmjs.com) run:

```sh
npm install next-graphql-react graphql-react
```

See the [`withGraphQL`](#function-withgraphql) examples to get started.

## Support

- Node.js v8.5+
- Browsers [`> 0.5%, not dead`](https://browserl.ist/?q=%3E+0.5%25%2C+not+dead)

Consider polyfilling:

- [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API)

## API

### Table of contents

- [function withGraphQL](#function-withgraphql)
  - [See](#see)
  - [Examples](#examples)

### function withGraphQL

A React higher-order component to decorate a Next.js `pages/_app.js` custom `App` component for [`graphql-react`](https://npm.im/graphql-react), enabling descendant GraphQL queries with server side rendering and client side data hydration.

| Parameter | Type                            | Description                     |
| :-------- | :------------------------------ | :------------------------------ |
| `App`     | [Object](https://mdn.io/object) | Next.js custom `App` component. |

**Returns:** withGraphQL~AppWithGraphQL — Next.js custom `App` higher-order component.

#### See

- [Next.js custom `<App>` docs](https://nextjs.org/docs#custom-app).
- [React higher-order component docs](https://reactjs.org/docs/higher-order-components).

#### Examples

_A custom `App`._

> In `pages/_app.js`:
>
> ```js
> import 'cross-fetch/polyfill'
> import { Provider } from 'graphql-react'
> import { withGraphQL } from 'next-graphql-react'
> import App, { Container } from 'next/app'
>
> class CustomApp extends App {
>   render() {
>     const { Component, pageProps, graphql } = this.props
>     return (
>       <Container>
>         <Provider value={graphql}>
>           <Component {...pageProps} />
>         </Provider>
>       </Container>
>     )
>   }
> }
>
> export default withGraphQL(CustomApp)
> ```
