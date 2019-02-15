import { GraphQL } from 'graphql-react'
import { ssr } from 'graphql-react/server'
import Head from 'next/head'
import React from 'react'

/**
 * A higher-order React component to decorate a Next.js custom `App` component
 * in `pages/_app.js` for [`graphql-react`](https://npm.im/graphql-react),
 * enabling descendant GraphQL operations with server side rendering and client
 * side data hydration.
 * @see [Next.js custom `App` docs](https://nextjs.org/docs#custom-app).
 * @see [React higher-order component docs](https://reactjs.org/docs/higher-order-components).
 * @kind function
 * @name withGraphQLApp
 * @param {Object} App Next.js custom `App` component.
 * @returns {WithGraphQL} Next.js custom `App` higher-order component.
 * @example <caption>A custom `App`.</caption>
 * In `pages/_app.js`:
 *
 * ```js
 * import 'cross-fetch/polyfill'
 * import { GraphQLContext } from 'graphql-react'
 * import { withGraphQLApp } from 'next-graphql-react'
 * import App, { Container } from 'next/app'
 *
 * class CustomApp extends App {
 *   render() {
 *     const { Component, pageProps, graphql } = this.props
 *     return (
 *       <Container>
 *         <GraphQLContext.Provider value={graphql}>
 *           <Component {...pageProps} />
 *         </GraphQLContext.Provider>
 *       </Container>
 *     )
 *   }
 * }
 *
 * export default withGraphQLApp(CustomApp)
 * ```
 */
export const withGraphQLApp = App =>
  /**
   * React higher-order component.
   * @kind class
   * @name WithGraphQL
   * @param {Object} props Props.
   * @param {Object} [props.graphqlCache] `GraphQL` cache; undefined for SSR, defined for client render.
   * @param {GraphQL} [props.graphql] `GraphQL` instance; undefined for SSR, undefined for client render.
   * @returns {ReactElement} React virtual DOM element.
   * @ignore
   */
  class WithGraphQL extends React.Component {
    /**
     * The higher-order component’s display name.
     * @see [React display name conventions](https://reactjs.org/docs/higher-order-components#convention-wrap-the-display-name-for-easy-debugging).
     * @kind member
     * @name WithGraphQL.displayName
     * @type {string}
     * @ignore
     */
    static displayName = `WithGraphQL(${App.displayName ||
      App.name ||
      'Component'})`

    /**
     * Gets the higher-order component’s initial props. Implemented using
     * `Promise` instead  of `async`/`await` for smaller bundle size.
     * @kind function
     * @name WithGraphQL.getInitialProps
     * @param {Object} context App context.
     * @param {Object} context.ctx Context for the route page component’s `getInitialProps`.
     * @param {Object} context.router Router instance.
     * @param {Object} context.component Route page component.
     * @returns {Object} Props.
     * @ignore
     */
    static getInitialProps = context =>
      new Promise(resolve => {
        Promise.resolve(
          App.getInitialProps ? App.getInitialProps(context) : {}
        ).then(props => {
          // Next.js webpack config uses process.browser to eliminate code from
          // the relevant server/browser bundle.
          if (process.browser) resolve(props)
          else {
            const graphql = new GraphQL()

            ssr(
              graphql,
              <App
                {...props}
                graphql={graphql}
                router={context.router}
                Component={context.Component}
              />
            )
              // eslint-disable-next-line no-console
              .catch(console.error)
              .then(() => {
                Head.rewind()
                props.graphqlCache = graphql.cache
                resolve(props)
              })
          }
        })
      })

    /**
     * The `GraphQL` instance.
     * @kind member
     * @name WithGraphQL#graphql
     * @type {GraphQL}
     * @ignore
     */
    graphql =
      // No prop type checks as the props are not exposed to consumers.
      // eslint-disable-next-line react/prop-types
      this.props.graphql || new GraphQL({ cache: this.props.graphqlCache })

    /**
     * Renders the component.
     * @kind function
     * @name WithGraphQL#render
     * @returns {ReactElement} React virtual DOM element.
     * @ignore
     */
    render() {
      const { ...appProps } = this.props
      delete appProps.graphqlCache

      return <App {...appProps} graphql={this.graphql} />
    }
  }
