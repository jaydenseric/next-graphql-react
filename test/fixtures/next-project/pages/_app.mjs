import "../polyfills.js";

import Link from "next/link.js";
import React from "react";
import JsxRuntime from "react/jsx-runtime.js";

import withGraphQLReact from "../../../../withGraphQLReact.mjs";

if (typeof CustomEvent === "undefined") throw new Error("polyfill failed");

const App = ({ Component, pageProps = {} }) =>
  JsxRuntime.jsxs(React.Fragment, {
    children: [
      JsxRuntime.jsx(Link, {
        href: "/second",
        passHref: true,
        children: JsxRuntime.jsx("a", {
          children: "Second",
        }),
      }),
      JsxRuntime.jsx(Component, pageProps),
    ],
  });

// This is for testing that an original response `Link` header is respected by
// `withGraphQLReact`.
App.getInitialProps = async (context) => {
  if (
    !process.browser &&
    // This is SSR for a real request, and not a Next.js static HTML export that
    // has a mock a Node.js response.
    context.ctx.res.statusCode &&
    context.ctx.query.linkHeaderNext
  )
    context.ctx.res.setHeader(
      "Link",
      decodeURIComponent(context.ctx.query.linkHeaderNext)
    );

  return {};
};

export default withGraphQLReact(App);
