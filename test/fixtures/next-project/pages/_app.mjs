// @ts-check

import "../polyfills.js";

import NextApp from "next/app.js";
import NextLink from "next/link.js";
import React from "react";

import withGraphQLReact from "../../../../withGraphQLReact.mjs";

if (typeof CustomEvent === "undefined") throw new Error("polyfill failed");

/**
 * React component for the Next.js app.
 * @param {import("next/app.js").AppProps} props Props.
 */
const App = ({ Component, pageProps = {} }) =>
  React.createElement(
    React.Fragment,
    null,
    React.createElement(
      NextLink.default,
      {
        href: "/second",
        passHref: true,
      },
      React.createElement("a", null, "Second"),
    ),
    React.createElement(Component, pageProps),
  );

// This is for testing that an original response `Link` header is respected by
// `withGraphQLReact`.
/** @param {import("next/app.js").AppContext} context */
App.getInitialProps = async (context) => {
  if (
    // @ts-ignore This is defined by Next.js.
    !process.browser &&
    // This is SSR for a real request, and not a Next.js static HTML export
    // that has a mock a Node.js response.
    context.ctx.res?.statusCode &&
    typeof context.ctx.query.linkHeaderNext === "string"
  )
    context.ctx.res.setHeader(
      "Link",

      // Todo: Also test setting a header array.
      decodeURIComponent(context.ctx.query.linkHeaderNext),
    );

  return NextApp.default.getInitialProps(context);
};

export default withGraphQLReact(App);
