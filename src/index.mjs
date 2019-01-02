import { GraphQL, preload } from 'graphql-react'
import Head from 'next/head'
import React from 'react'

/**
 * A React higher-order component to decorate a Next.js `pages/_app.js` custom
 * `App` component for [`graphql-react`](https://npm.im/graphql-react), enabling
 * descendant GraphQL queries with server side rendering and client side data
 * hydration.
 * @see [Next.js custom `<App>` docs](https://nextjs.org/docs#custom-app).
 * @see [React higher-order component docs](https://reactjs.org/docs/higher-order-components).
 * @kind function
 * @name withGraphQL
 * @param {Object} App Next.js custom `App` component.
 * @returns {withGraphQL~AppWithGraphQL} Next.js custom `App` higher-order component.
 * @example <caption>A custom `App`.</caption>
 * In `pages/_app.js`:
 *
 * ```js
 * import 'cross-fetch/polyfill'
 * import { Provider } from 'graphql-react'
 * import { withGraphQL } from 'next-graphql-react'
 * import App, { Container } from 'next/app'
 *
 * class CustomApp extends App {
 *   render() {
 *     const { Component, pageProps, graphql } = this.props
 *     return (
 *       <Container>
 *         <Provider value={graphql}>
 *           <Component {...pageProps} />
 *         </Provider>
 *       </Container>
 *     )
 *   }
 * }
 *
 * export default withGraphQL(CustomApp)
 * ```
 */
export const withGraphQL = App => {
  /**
   * React higher-order component.
   * @kind function
   * @name withGraphQL~AppWithGraphQL
   * @param {Object} props Props.
   * @param {Object} [props.cache] GraphQL cache; undefined for SSR, defined for client render.
   * @param {GraphQL} [props.graphql] GraphQL instance; undefined for SSR, undefined for client render.
   * @returns {ReactElement} React virtual DOM element.
   * @ignore
   */
  const AppWithGraphQL = ({
    // No prop type checks as the props are not exposed to consumers.
    // eslint-disable-next-line react/prop-types
    cache,
    // eslint-disable-next-line react/prop-types
    graphql = new GraphQL({ cache }),
    ...appProps
  }) => <App {...appProps} graphql={graphql} />

  AppWithGraphQL.displayName = `withGraphQL(${App.displayName ||
    App.name ||
    'Unknown'})`

  /**
   * Gets the `App` component’s initial props. Implemented using `Promise`
   * instead  of `async`/`await` for smaller bundle size.
   * @kind function
   * @name withGraphQL~AppWithGraphQL.getInitialProps
   * @param {Object} context `App` context.
   * @param {Object} context.ctx Context for the route page component’s `getInitialProps`.
   * @param {Object} context.router Router instance.
   * @param {Object} context.component Route page component.
   * @returns {Object} `App` component props.
   * @ignore
   */
  AppWithGraphQL.getInitialProps = context =>
    new Promise(resolve => {
      Promise.resolve(
        App.getInitialProps ? App.getInitialProps(context) : {}
      ).then(props => {
        if (!context.ctx.req)
          // Not SSR environment.
          return resolve(props)

        const graphql = new GraphQL()

        preload(
          <App
            {...props}
            graphql={graphql}
            router={context.router}
            Component={context.Component}
          />
        ).then(() => {
          Head.rewind()
          props.cache = graphql.cache
          resolve(props)
        })
      })
    })

  return AppWithGraphQL
}
