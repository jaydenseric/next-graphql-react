'use strict';

const Cache = require('graphql-react/public/Cache.js');
const Provider = require('graphql-react/public/Provider.js');
const { default: NextApp } = require('next/app');
const { useRef } = require('react');
const { jsx } = require('react/jsx-runtime');

/**
 * Link `rel` types that make sense to forward from loading responses during SSR
 * in the [Next.js](https://nextjs.org) page response.
 * @kind constant
 * @name FORWARDABLE_LINK_REL
 * @type {Array<string>}
 * @see [HTML Living Standard link types](https://html.spec.whatwg.org/dev/links.html#linkTypes).
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
 * A [Next.js](https://nextjs.org) custom `App` [React](https://reactjs.org)
 * component decorator that returns a higher-order [React](https://reactjs.org)
 * component that enables the [`graphql-react`](https://npm.im/graphql-react)
 * [React](https://reactjs.org) hooks within children for loading and caching
 * data that can be server side rendered and hydrated on the client.
 *
 * After
 * [waterfall rendering](https://github.com/jaydenseric/react-waterfall-render)
 * for a server side render, cache values are scanned for a `response` property
 * (which should be non-enumerable so it won’t be included in the serialized
 * JSON sent to the client for hydration) that is a
 * [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)
 * instance. Any of the following HTTP
 * [`Link`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link)
 * headers found in the responses are deduped and forwarded to the client in the
 * [Next.js](https://nextjs.org) page response:
 *
 * - [`dns-prefetch`](https://html.spec.whatwg.org/dev/links.html#link-type-dns-prefetch)
 * - [`preconnect`](https://html.spec.whatwg.org/dev/links.html#link-type-preconnect)
 * - [`prefetch`](https://html.spec.whatwg.org/dev/links.html#link-type-prefetch)
 * - [`preload`](https://html.spec.whatwg.org/dev/links.html#link-type-preload)
 * - [`modulepreload`](https://html.spec.whatwg.org/dev/links.html#link-type-modulepreload)
 * - [`prerender`](https://html.spec.whatwg.org/dev/links.html#link-type-prerender)
 *
 * Link URLs are forwarded unmodified, so avoid sending relative URLs from a
 * [GraphQL](https://graphql.org) server hosted on a different domain to the
 * app.
 * @kind function
 * @name withGraphQLReact
 * @param {object} App [Next.js](https://nextjs.org) custom `App` [React](https://reactjs.org) component.
 * @returns {withGraphQLReact~WithGraphQLReact} [Next.js](https://nextjs.org) custom `App` higher-order [React](https://reactjs.org) component.
 * @see [Next.js custom `App` docs](https://nextjs.org/docs/advanced-features/custom-app).
 * @see [React higher-order component docs](https://reactjs.org/docs/higher-order-components).
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { withGraphQLReact } from 'next-graphql-react';
 * ```
 *
 * ```js
 * import withGraphQLReact from 'next-graphql-react/public/withGraphQLReact.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { withGraphQLReact } = require('next-graphql-react');
 * ```
 *
 * ```js
 * const withGraphQLReact = require('next-graphql-react/public/withGraphQLReact.js');
 * ```
 * @example <caption>A [Next.js](https://nextjs.org) custom `App`.</caption>
 * In `pages/_app.js`:
 *
 * ```jsx
 * import withGraphQLReact from 'next-graphql-react/public/withGraphQLReact.js';
 * import App from 'next/app';
 *
 * export default withGraphQLReact(App);
 * ```
 */
module.exports = function withGraphQLReact(App) {
  /**
   * [Next.js](https://nextjs.org) custom `App` higher-order
   * [React](https://reactjs.org) component.
   * @kind function
   * @name withGraphQLReact~WithGraphQLReact
   * @param {object} props Props.
   * @param {Cache} [props.cache] `Cache` instance; defined for SSR, undefined for client render.
   * @param {object} [props.initialCacheStore] Initial `Cache` store; undefined for SSR, defined for client render.
   * @returns {ReactElement} [React](https://reactjs.org) virtual DOM element.
   * @ignore
   */
  function WithGraphQLReact({ cache, initialCacheStore, ...appProps }) {
    const cacheRef = useRef();

    // This avoids re-creating the React ref initial value, see:
    // https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
    if (!cacheRef.current)
      cacheRef.current = cache || new Cache(initialCacheStore);

    return jsx(Provider, {
      cache: cacheRef.current,
      children: jsx(App, appProps),
    });
  }

  // Next.js webpack config uses `process.browser` to eliminate code from the
  // relevant server/browser bundles. `typeof window === 'undefined'` can’t be
  // used, because Next.js implements that using Babel, which doesn’t run on
  // `node_modules`.
  if (!process.browser) {
    // The following code should be eliminated from client bundles.

    const LinkHeader = require('http-link-header');
    const { renderToStaticMarkup } = require('react-dom/server');
    const waterfallRender = require('react-waterfall-render/public/waterfallRender.js');

    /**
     * Gets the initial props.
     * @kind function
     * @name withGraphQLReact~WithGraphQLReact.getInitialProps
     * @param {object} context App context.
     * @param {object} context.ctx Context for the route page [React](https://reactjs.org) component’s `getInitialProps`.
     * @param {object} context.router Router instance.
     * @param {object} context.component Route page [React](https://reactjs.org) component.
     * @returns {Promise<object>} Initial props.
     * @ignore
     */
    WithGraphQLReact.getInitialProps = async (context) => {
      const props = await (App.getInitialProps
        ? App.getInitialProps(context)
        : NextApp.getInitialProps(context));
      const cache = new Cache();

      try {
        await waterfallRender(
          jsx(context.AppTree, { cache, ...props }),
          renderToStaticMarkup
        );
      } catch (error) {
        console.error(error);
      }

      props.initialCacheStore = cache.store;

      // Check this is a real, dynamic request and not a Next.js static HTML
      // export, either for the static HTML error pages generated by running
      // `next build` or for the whole project exported to static HTML by
      // running `next export`. Although Next.js docs say for a static HTML
      // export `ctx.res` will be an empty object, actually Next.js mocks some
      // of the header related properties. Because `statusCode` is never mocked,
      // its presence is used to detect if the request is real. See:
      // https://nextjs.org/docs/advanced-features/static-html-export#caveats
      if ('statusCode' in context.ctx.res) {
        // This will hold all the `Link` headers parsed from loaded cache value
        // responses.
        const linkHeaderPlanLoadingResponses = new LinkHeader();

        for (const cacheValue of Object.values(cache.store))
          if (
            // Potentially any type of data could be cached, not just objects
            // for fetched GraphQL.
            typeof cacheValue === 'object' &&
            // The `fetch` API `Response` global should be polyfilled for
            // Node.js if there are cache values derived from `fetch` `Response`
            // instances. In case there are not, guard against the global being
            // undefined.
            typeof Response === 'function' &&
            // As a convention, any cache value that’s derived from a `fetch`
            // `Response` instance should attach it as a non-enumerable property
            // to the cache value object so it can be inspected, but won’t
            // serialize to JSON when the cache store is exported for hydration
            // on the client after SSR.
            cacheValue.response instanceof Response
          ) {
            const linkHeader = cacheValue.response.headers.get('Link');
            if (linkHeader)
              try {
                linkHeaderPlanLoadingResponses.parse(linkHeader);
              } catch (error) {
                // Ignore a parse error.
              }
          }

        const linkHeaderPlanForwardable = new LinkHeader();

        linkHeaderPlanLoadingResponses.refs.forEach((link) => {
          if (
            // The link has a forwardable `rel`.
            FORWARDABLE_LINK_REL.includes(link.rel) &&
            // A similar link isn’t already set.
            !linkHeaderPlanForwardable.refs.some(
              ({ uri, rel }) => uri === link.uri && rel === link.rel
            )
          )
            linkHeaderPlanForwardable.set(link);
        });

        if (linkHeaderPlanForwardable.refs.length) {
          let linkHeaderPlanResponseFinal = linkHeaderPlanForwardable;

          const linkHeaderResponseOriginal = context.ctx.res.getHeader('Link');

          if (linkHeaderResponseOriginal) {
            // The Node.js response `setHeader` API doesn’t do any input
            // validation, so project code using this API could have set any
            // type of unparsable value for the original response `Link` header.
            // If it’s parsable, merge in the forwardable links from the GraphQL
            // responses to create the final response `Link` header.
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

              linkHeaderPlanForwardable.refs.forEach((link) => {
                if (
                  // A similar link isn’t already set.
                  !linkHeaderPlanResponseFinal.refs.some(
                    ({ uri, rel }) => uri === link.uri && rel === link.rel
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
      }

      return props;
    };
  }

  if (typeof process === 'object' && process.env.NODE_ENV !== 'production')
    /**
     * The display name.
     * @kind member
     * @name withGraphQLReact~WithGraphQLReact.displayName
     * @type {string}
     * @see [React display name conventions](https://reactjs.org/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging).
     * @ignore
     */
    WithGraphQLReact.displayName = `WithGraphQLReact(${
      App.displayName || App.name || 'Component'
    })`;

  return WithGraphQLReact;
};
