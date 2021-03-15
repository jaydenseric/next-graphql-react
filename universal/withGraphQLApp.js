'use strict';

const GraphQL = require('graphql-react/universal/GraphQL');
const { default: NextApp } = require('next/app');
const { Component } = require('react');
const { jsx } = require('react/jsx-runtime');

/**
 * Link `rel` types that make sense to forward from a GraphQL responses during
 * SSR in the Next.js page response
 * @see [HTML Living Standard link types](https://html.spec.whatwg.org/dev/links.html#linkTypes).
 * @kind constant
 * @name FORWARDABLE_LINK_REL
 * @type {Array<string>}
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
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { withGraphQLApp } from 'next-graphql-react';
 * ```
 *
 * ```js
 * import withGraphQLApp from 'next-graphql-react/universal/withGraphQLApp.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { withGraphQLApp } = require('next-graphql-react');
 * ```
 *
 * ```js
 * const withGraphQLApp = require('next-graphql-react/universal/withGraphQLApp');
 * ```
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
  class WithGraphQL extends Component {
    constructor(props) {
      super(props);

      /**
       * The `GraphQL` instance.
       * @kind member
       * @name WithGraphQL#graphql
       * @type {GraphQL}
       * @ignore
       */
      this.graphql =
        // No prop type checks as the props are not exposed to consumers.
        // eslint-disable-next-line react/prop-types
        this.props.graphql || new GraphQL({ cache: this.props.graphqlCache });
    }

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

      return jsx(App, { ...appProps, graphql: this.graphql });
    }
  }

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
  WithGraphQL.getInitialProps = (context) =>
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

          // Check this is not a Next.js static HTML export. If it is, Next.js
          // docs say `ctx.res` will be an empty object, although in reality a
          // few header related properties are mocked. That’s why `statusCode`
          // is checked here instead of something more relevant.
          // See: https://nextjs.org/docs/advanced-features/static-html-export#caveats
          if (context.ctx.res.statusCode) {
            const LinkHeader = require('http-link-header');
            const linkHeaderPlanGraphQLResponses = new LinkHeader();

            graphql.on('cache', ({ response }) => {
              // The response may be undefined if there were fetch errors.
              if (response) {
                const linkHeader = response.headers.get('Link');
                if (linkHeader)
                  try {
                    linkHeaderPlanGraphQLResponses.parse(linkHeader);
                  } catch (error) {
                    // Ignore a parse error.
                  }
              }
            });

            ssr(graphql, jsx(context.AppTree, { ...props, graphql }))
              .catch(console.error)
              .then(() => {
                Head.rewind();

                const linkHeaderPlanGraphQLForwardable = new LinkHeader();

                linkHeaderPlanGraphQLResponses.refs.forEach((link) => {
                  if (
                    // The link has a forwardable `rel`.
                    FORWARDABLE_LINK_REL.includes(link.rel) &&
                    // A similar link isn’t already set.
                    !linkHeaderPlanGraphQLForwardable.refs.some(
                      ({ uri, rel }) => uri === link.uri && rel === link.rel
                    )
                  )
                    linkHeaderPlanGraphQLForwardable.set(link);
                });

                if (linkHeaderPlanGraphQLForwardable.refs.length) {
                  let linkHeaderPlanResponseFinal = linkHeaderPlanGraphQLForwardable;

                  const linkHeaderResponseOriginal = context.ctx.res.getHeader(
                    'Link'
                  );

                  if (linkHeaderResponseOriginal) {
                    // The Node.js response `setHeader` API doesn’t do any
                    // input validation, so project code using this API could
                    // have set any type of unparsable value for the original
                    // response `Link` header. If it’s parsable, merge in the
                    // forwardable links from the GraphQL responses to create
                    // the final response `Link` header.
                    try {
                      var linkHeaderPlanResponseOriginal = new LinkHeader(
                        linkHeaderResponseOriginal
                      );
                    } catch (error) {
                      // Ignore a parse error. It’s ok to exclude the original
                      // unparsable `Link` header in the final response.
                    }

                    if (linkHeaderPlanResponseOriginal) {
                      linkHeaderPlanResponseFinal = linkHeaderPlanResponseOriginal;

                      linkHeaderPlanGraphQLForwardable.refs.forEach((link) => {
                        if (
                          // A similar link isn’t already set.
                          !linkHeaderPlanResponseFinal.refs.some(
                            ({ uri, rel }) =>
                              uri === link.uri && rel === link.rel
                          )
                        )
                          linkHeaderPlanResponseFinal.set(link);
                      });
                    }
                  }

                  context.ctx.res.setHeader(
                    'Link',
                    linkHeaderPlanResponseFinal.toString()
                  );
                }

                props.graphqlCache = graphql.cache;
                resolve(props);
              });
          } else
            ssr(graphql, jsx(context.AppTree, { ...props, graphql }))
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
   * The higher-order component’s display name.
   * @see [React display name conventions](https://reactjs.org/docs/higher-order-components#convention-wrap-the-display-name-for-easy-debugging).
   * @kind member
   * @name WithGraphQL.displayName
   * @type {string}
   * @ignore
   */
  WithGraphQL.displayName = `WithGraphQL(${
    App.displayName || App.name || 'Component'
  })`;

  return WithGraphQL;
};
