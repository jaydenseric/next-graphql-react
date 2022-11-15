// @ts-check

import Cache from "graphql-react/Cache.mjs";
import Provider from "graphql-react/Provider.mjs";
import nextApp from "next/app.js";
import React from "react";

import cjsDefaultImport from "./cjsDefaultImport.mjs";

const NextApp = cjsDefaultImport(nextApp);

/**
 * Link `rel` types that make sense to forward from loading responses during SSR
 * in the [Next.js](https://nextjs.org) page response.
 * @type {Array<string>}
 * @see [HTML Living Standard link types](https://html.spec.whatwg.org/dev/links.html#linkTypes).
 */
const FORWARDABLE_LINK_REL = [
  "dns-prefetch",
  "preconnect",
  "prefetch",
  "preload",
  "modulepreload",
  "prerender",
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
 * @param {import("react").ComponentType<import("next/app.js").AppProps> & {
 *   getInitialProps?: ({
 *     Component,
 *     ctx,
 *   }: import("next/app.js").AppContext) =>
 *     | import("next/app.js").AppInitialProps
 *     | Promise<import("next/app.js").AppInitialProps>
 * }} App [Next.js](https://nextjs.org) custom `App`
 *   [React](https://reactjs.org) component.
 * @returns [Next.js](https://nextjs.org) custom `App` higher-order
 *   [React](https://reactjs.org) component.
 * @see [Next.js custom `App` docs](https://nextjs.org/docs/advanced-features/custom-app).
 * @see [React higher-order component docs](https://reactjs.org/docs/higher-order-components).
 * @example
 * A [Next.js](https://nextjs.org) custom `App` in `pages/_app.js`:
 *
 * ```js
 * import withGraphQLReact from "next-graphql-react/withGraphQLReact.mjs";
 * import App from "next/app";
 *
 * export default withGraphQLReact(App);
 * ```
 */
export default function withGraphQLReact(App) {
  /**
   * [Next.js](https://nextjs.org) custom `App` higher-order
   * [React](https://reactjs.org) component.
   * @param {import("next/app.js").AppProps & {
   *   cache?: Cache,
   *   initialCacheStore?: import("graphql-react/Cache.mjs").CacheStore
   * }} props Props.
   */
  function WithGraphQLReact({ cache, initialCacheStore, ...appProps }) {
    const cacheRef = React.useRef(/** @type {Cache | null} */ (null));

    // This avoids re-creating the React ref initial value, see:
    // https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
    if (!cacheRef.current)
      cacheRef.current = cache || new Cache(initialCacheStore);

    return React.createElement(
      Provider,
      { cache: cacheRef.current },
      React.createElement(App, appProps)
    );
  }

  // Next.js webpack config uses `process.browser` to eliminate code from the
  // relevant server/browser bundles. `typeof window === "undefined"` can’t be
  // used, because Next.js implements that using Babel, which doesn’t run on
  // `node_modules`.
  if (
    // @ts-ignore This is defined by Next.js.
    !process.browser
  )
    // The following code should be eliminated from client bundles.

    /**
     * Gets the initial props.
     * @param {import("next/app.js").AppContext} context App context.
     * @returns {Promise<
     *   import("next/app.js").AppInitialProps &
     *     { initialCacheStore: import("graphql-react/Cache.mjs").CacheStore }
     * >} Initial props.
     */
    WithGraphQLReact.getInitialProps = async (context) => {
      const [
        appProps,
        { default: ReactDOMServer },
        { default: waterfallRender },
      ] = await Promise.all([
        App.getInitialProps
          ? App.getInitialProps(context)
          : NextApp.getInitialProps(context),
        import("react-dom/server"),
        import("react-waterfall-render/waterfallRender.mjs"),
      ]);

      const cache = new Cache();

      try {
        await waterfallRender(
          React.createElement(context.AppTree, { cache, ...appProps }),
          ReactDOMServer.renderToStaticMarkup
        );
      } catch (error) {
        console.error(error);
      }

      // Check this is a real, dynamic request and not a Next.js static HTML
      // export, either for the static HTML error pages generated by running
      // `next build` or for the whole project exported to static HTML by
      // running `next export`. Although Next.js docs say for a static HTML
      // export `ctx.res` will be an empty object, actually Next.js mocks some
      // of the header related properties. Because `statusCode` is never mocked,
      // its presence is used to detect if the request is real. See:
      // https://nextjs.org/docs/advanced-features/static-html-export#caveats
      if (
        // This is just for TypeScript; it should always be true due to the
        // surrounding `process.browser` check.
        context.ctx.res &&
        "statusCode" in context.ctx.res
      ) {
        const { default: LinkHeader } = await import("http-link-header");

        // This will hold all the `Link` headers parsed from loaded cache value
        // responses.
        const linkHeaderPlanLoadingResponses = new LinkHeader();

        for (const cacheValue of Object.values(cache.store))
          if (
            // Potentially any type of data could be cached, not just objects
            // for fetched GraphQL.
            typeof cacheValue === "object" &&
            // Not null.
            cacheValue &&
            // The `fetch` API `Response` global should be polyfilled for
            // Node.js if there are cache values derived from `fetch` `Response`
            // instances. In case there are not, guard against the global being
            // undefined.
            typeof Response === "function" &&
            // As a convention, any cache value that’s derived from a `fetch`
            // `Response` instance should attach it as a non-enumerable property
            // to the cache value object so it can be inspected, but won’t
            // serialize to JSON when the cache store is exported for hydration
            // on the client after SSR.
            /** @type {{ [key: string]: unknown }} */ (cacheValue)
              .response instanceof Response
          ) {
            const linkHeader = /** @type {{ [key: string]: unknown }} */ (
              cacheValue
            ).response.headers.get("Link");
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

          const linkHeaderResponseOriginal = context.ctx.res.getHeader("Link");

          if (linkHeaderResponseOriginal) {
            // Normalize the original header into an array, as it could have
            // been set as either a string or an array of strings.
            const linkHeaderResponseOriginalArray = Array.isArray(
              linkHeaderResponseOriginal
            )
              ? linkHeaderResponseOriginal
              : [linkHeaderResponseOriginal];

            // The Node.js response `setHeader` API doesn’t do any input
            // validation, so project code using this API could have set any
            // type of unparsable value for the original response `Link` header.
            // If it’s parsable, merge in the forwardable links from the GraphQL
            // responses to create the final response `Link` header.

            const linkHeaderPlanResponseOriginal = new LinkHeader();

            for (const linkHeaderResponseOriginal of linkHeaderResponseOriginalArray) {
              try {
                linkHeaderPlanResponseOriginal.parse(
                  linkHeaderResponseOriginal
                );
              } catch (error) {
                // Ignore a parse error. It’s ok to exclude the original
                // unparsable `Link` header in the final response.
              }
            }

            if (linkHeaderPlanResponseOriginal.refs.length) {
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
            "Link",
            linkHeaderPlanResponseFinal.toString()
          );
        }
      }

      return {
        ...appProps,
        initialCacheStore: cache.store,
      };
    };

  if (typeof process === "object" && process.env.NODE_ENV !== "production")
    /**
     * The display name.
     * @type {string}
     * @see [React display name conventions](https://reactjs.org/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging).
     */
    WithGraphQLReact.displayName = `WithGraphQLReact(${
      App.displayName || App.name || "Component"
    })`;

  return WithGraphQLReact;
}
