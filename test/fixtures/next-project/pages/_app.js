'use strict';

require('../polyfills.js');
const { default: Link } = require('next/link');
const { Fragment, jsx, jsxs } = require('react/jsx-runtime');
const withGraphQLReact = require('../../../../public/withGraphQLReact.js');

const App = ({ Component, pageProps = {} }) =>
  jsxs(Fragment, {
    children: [
      jsx(Link, {
        href: '/second',
        passHref: true,
        children: jsx('a', {
          children: 'Second',
        }),
      }),
      jsx(Component, pageProps),
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
      'Link',
      decodeURIComponent(context.ctx.query.linkHeaderNext)
    );

  return {};
};

module.exports = withGraphQLReact(App);
