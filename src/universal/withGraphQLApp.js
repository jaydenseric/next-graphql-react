'use strict';

const GraphQL = require('graphql-react/universal/GraphQL');
const { default: NextApp } = require('next/app');
const React = require('react');

/**
 * Link `rel` types that make sense to forward from a GraphQL responses during
 * SSR in the Next.js page response
 * @see [HTML Living Standard link types](https://html.spec.whatwg.org/dev/links.html#linkTypes).
 * @kind constant
 * @name FORWARDABLE_LINK_REL
 * @ignore
 */
const FORWARDABLE_LINK_REL = [
  'dns-prefetch',
  'preconnect',
  'prefetch',
  'preload',
  'modulepreload',
  'prerender',
];

/**
 * A higher-order React component to decorate a Next.js custom `App` component
 * in `pages/_app.js` for [`graphql-react`](https://npm.im/graphql-react),
 * enabling descendant GraphQL operations with server side rendering and client
 * side data hydration.
 *
 * It also forwards HTTP
 * [`Link`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link)
 * headers with the following `rel` parameters from GraphQL responses received
 * when [`ssr`](https://github.com/jaydenseric/graphql-react#function-ssr) runs
 * to the Next.js page response:
 *
 * - [`dns-prefetch`](https://html.spec.whatwg.org/dev/links.html#link-type-dns-prefetch)
 * - [`preconnect`](https://html.spec.whatwg.org/dev/links.html#link-type-preconnect)
 * - [`prefetch`](https://html.spec.whatwg.org/dev/links.html#link-type-prefetch)
 * - [`preload`](https://html.spec.whatwg.org/dev/links.html#link-type-preload)
 * - [`modulepreload`](https://html.spec.whatwg.org/dev/links.html#link-type-modulepreload)
 * - [`prerender`](https://html.spec.whatwg.org/dev/links.html#link-type-prerender)
 *
 * Link URLs are forwarded unmodified, so avoid sending relative URLs
 * from a GraphQL server hosted on a different domain to the app.
 * @see [Next.js custom `App` docs](https://nextjs.org/docs#custom-app).
 * @see [React higher-order component docs](https://reactjs.org/docs/higher-order-components).
 * @kind function
 * @name withGraphQLApp
 * @param {object} App Next.js custom `App` component.
 * @returns {WithGraphQL} Next.js custom `App` higher-order component.
 * @example <caption>A custom `App`.</caption>
 * In `pages/_app.js`:
 *
 * ```jsx
 * import { GraphQLProvider } from 'graphql-react';
 * import { withGraphQLApp } from 'next-graphql-react';
 * import React from 'react';
 *
 * const App = ({ Component, pageProps, graphql }) => (
 *   <GraphQLProvider graphql={graphql}>
 *     <Component {...pageProps} />
 *   </GraphQLProvider>
 * );
 *
 * export default withGraphQLApp(App);
 * ```
 */
module.exports = function withGraphQLApp(App) {
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
  return class WithGraphQL extends React.Component {
    /**
     * The higher-order component’s display name.
     * @see [React display name conventions](https://reactjs.org/docs/higher-order-components#convention-wrap-the-display-name-for-easy-debugging).
     * @kind member
     * @name WithGraphQL.displayName
     * @type {string}
     * @ignore
     */
    static displayName = `WithGraphQL(${
      App.displayName || App.name || 'Component'
    })`;

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
    static getInitialProps = (context) =>
      new Promise((resolve) => {
        Promise.resolve(
          App.getInitialProps
            ? App.getInitialProps(context)
            : NextApp.getInitialProps(context)
        ).then((props) => {
          // Next.js webpack config uses `process.browser` to eliminate code
          // from the relevant server/browser bundle.
          if (process.browser) resolve(props);
          else {
            const ssr = require('graphql-react/server/ssr');
            const { default: Head } = require('next/head');
            const graphql = new GraphQL();

            // Check if this is a Next.js static HTML export. If it is, Next.js
            // docs say `ctx.res` will be an empty object, although in reality a
            // few header related properties are mimicked. That is why
            // `statusCode` is checked here instead of something more relevant.
            // See: https://nextjs.org/docs/advanced-features/static-html-export#caveats
            if (context.ctx.res.statusCode) {
              const LinkHeader = require('http-link-header');
              const graphqlLinkHeader = new LinkHeader();

              graphql.on('cache', ({ response }) => {
                // The response may be undefined if there were fetch errors.
                if (response) {
                  const linkHeader = response.headers.get('Link');
                  if (linkHeader) graphqlLinkHeader.parse(linkHeader);
                }
              });

              ssr(graphql, <context.AppTree {...props} graphql={graphql} />)
                .catch(console.error)
                .then(() => {
                  Head.rewind();

                  const responseLinkHeader = new LinkHeader(
                    // Might be undefined.
                    context.ctx.res.getHeader('Link')
                  );

                  graphqlLinkHeader.refs.forEach((graphqlLink) => {
                    if (
                      FORWARDABLE_LINK_REL.includes(graphqlLink.rel) &&
                      // Similar link not already set.
                      !responseLinkHeader.refs.some(
                        ({ uri, rel }) =>
                          uri === graphqlLink.uri && rel === graphqlLink.rel
                      )
                    )
                      responseLinkHeader.set(graphqlLink);
                  });

                  if (responseLinkHeader.refs.length)
                    context.ctx.res.setHeader(
                      'Link',
                      responseLinkHeader.toString()
                    );

                  props.graphqlCache = graphql.cache;
                  resolve(props);
                });
            } else
              ssr(graphql, <context.AppTree {...props} graphql={graphql} />)
                .catch(console.error)
                .then(() => {
                  Head.rewind();
                  props.graphqlCache = graphql.cache;
                  resolve(props);
                });
          }
        });
      });

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
      this.props.graphql || new GraphQL({ cache: this.props.graphqlCache });

    /**
     * Renders the component.
     * @kind function
     * @name WithGraphQL#render
     * @returns {ReactElement} React virtual DOM element.
     * @ignore
     */
    render() {
      const { ...appProps } = this.props;
      delete appProps.graphqlCache;

      return <App {...appProps} graphql={this.graphql} />;
    }
  };
};
