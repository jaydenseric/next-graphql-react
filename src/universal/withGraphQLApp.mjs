import { GraphQL } from 'graphql-react'
import { ssr } from 'graphql-react/server'
// These import paths are bare so that `withGraphQLConfig` can set resolve
// aliases pointing to empty decoys for the browser bundle.
// eslint-disable-next-line node/no-missing-import
import { filterLinkHeader } from 'next-graphql-react/server/filterLinkHeader'
// eslint-disable-next-line node/no-missing-import
import { mergeLinkHeaders } from 'next-graphql-react/server/mergeLinkHeaders'
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
 * @param {object} App Next.js custom `App` component.
 * @returns {WithGraphQL} Next.js custom `App` higher-order component.
 * @example <caption>A custom `App`.</caption>
 * In `pages/_app.js`:
 *
 * ```js
 * import 'cross-fetch/polyfill'
 * import { GraphQLProvider } from 'graphql-react'
 * import { withGraphQLApp } from 'next-graphql-react'
 * import App, { Container } from 'next/app'
 *
 * class CustomApp extends App {
 *   render() {
 *     const { Component, pageProps, graphql } = this.props
 *     return (
 *       <Container>
 *         <GraphQLProvider graphql={graphql}>
 *           <Component {...pageProps} />
 *         </GraphQLProvider>
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
   * @param {object} props Props.
   * @param {object} [props.graphqlCache] `GraphQL` cache; undefined for SSR, defined for client render.
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
     * @param {object} context App context.
     * @param {object} context.ctx Context for the route page component’s `getInitialProps`.
     * @param {object} context.router Router instance.
     * @param {object} context.component Route page component.
     * @returns {object} Props.
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
            const preloadLinkHeaders = []
            const graphql = new GraphQL()

            graphql.on('cache', ({ response }) => {
              // The response may be undefined if there were fetch errors.
              if (response) {
                const linkHeader = response.headers.get('Link')
                if (linkHeader)
                  preloadLinkHeaders.push(
                    filterLinkHeader(linkHeader, 'preload')
                  )
              }
            })

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

                const mergedLinkHeader = mergeLinkHeaders([
                  ...preloadLinkHeaders,

                  // Next.js Link header links override conflicting ones being
                  // forwarded from the GraphQL responses.
                  context.ctx.res.getHeader('Link')
                ])

                if (mergedLinkHeader)
                  context.ctx.res.setHeader('Link', mergedLinkHeader)

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
