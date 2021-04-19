/* eslint-disable no-console */

'use strict';

const { ok, strictEqual } = require('assert');
const fs = require('fs');
const { createServer } = require('http');
const { join, resolve } = require('path');
const { disposableDirectory } = require('disposable-directory');
const { installFrom } = require('install-from');
const puppeteer = require('puppeteer');
const { TestDirector } = require('test-director');
const { devDependencies } = require('../package.json');
const execFilePromise = require('./execFilePromise');
const listen = require('./listen');
const startNext = require('./startNext');

const NEXT_GRAPHQL_REACT_PATH = resolve(__dirname, '..');

const MARKER_A = 'MARKER_A';
const MARKER_B = 'MARKER_B';

// Dummy GraphQL server with a hardcoded response. The URL query string
// parameter `linkHeader` can be used to set an arbitrary `Link` header in the
// response.
const graphqlSever = createServer((request, response) => {
  const responseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept',
    'Content-Type': 'application/json',
  };

  const { searchParams } = new URL(
    request.url,
    `http://${request.headers.host}`
  );

  if (searchParams.has('linkHeader'))
    responseHeaders.Link = searchParams.get('linkHeader');

  response.writeHead(200, responseHeaders);
  response.write(
    JSON.stringify({
      data: {
        a: MARKER_A,
        b: MARKER_B,
      },
    })
  );
  response.end();
});

const tests = new TestDirector();

tests.add('Next.js production build and static HTML export.', async () => {
  const { port: portGraphqlSever, close: closeGraphqlSever } = await listen(
    graphqlSever
  );

  try {
    const urlGraphql = `http://localhost:${portGraphqlSever}`;

    await disposableDirectory(async (tempDirPath) => {
      console.group('Creating fixture project…');

      try {
        console.log('Creating files…');

        const packageJsonPath = join(tempDirPath, 'package.json');
        const nodePolyfillsPath = join(tempDirPath, 'nodePolyfills.js');
        const pagesPath = join(tempDirPath, 'pages');
        const appPath = join(pagesPath, '_app.js');
        const indexPagePath = join(pagesPath, 'index.js');
        const secondPagePath = join(pagesPath, 'second.js');

        await Promise.all([
          fs.promises.writeFile(
            packageJsonPath,
            `{
  "private": true,
  "dependencies": {
    "abort-controller": "${devDependencies['abort-controller']}",
    "event-target-shim": "${devDependencies['event-target-shim']}",
    "graphql-react": "${devDependencies['graphql-react']}",
    "next": "${devDependencies.next}",
    "react": "${devDependencies.react}",
    "react-dom": "${devDependencies['react-dom']}"
  }
}`
          ),
          fs.promises.writeFile(
            nodePolyfillsPath,
            `'use strict';

if (typeof window === 'undefined') {
  if (!('performance' in global))
    global.performance = require('perf_hooks').performance;

  if (!('EventTarget' in global))
    global.EventTarget =
      require('events').EventTarget || require('event-target-shim').EventTarget;

  if (!('Event' in global))
    global.Event = require('events').Event || require('event-target-shim').Event;

  if (!('CustomEvent' in global))
    global.CustomEvent = class CustomEvent extends Event {
      constructor(eventName, { detail, ...eventOptions } = {}) {
        super(eventName, eventOptions);
        this.detail = detail;
      }
    };

  require('abort-controller/polyfill');
}`
          ),
          fs.promises.mkdir(pagesPath).then(() =>
            Promise.all([
              fs.promises.writeFile(
                appPath,
                `import '${nodePolyfillsPath}';
import withGraphQLReact from 'next-graphql-react/public/withGraphQLReact.js';
import Link from 'next/link';

const App = ({ Component, pageProps }) => (
  <>
    <Link href="/second" passHref>
      <a>Second</a>
    </Link>
    <Component {...pageProps} />
  </>
);

// This is for testing that an original response \`Link\` header is respected by
// \`withGraphQLReact\`.
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

export default withGraphQLReact(App);`
              ),
              fs.promises.writeFile(
                indexPagePath,
                `import useAutoLoad from 'graphql-react/public/useAutoLoad.js';
import useCacheEntry from 'graphql-react/public/useCacheEntry.js';
import useLoadGraphQL from 'graphql-react/public/useLoadGraphQL.js';
import useWaterfallLoad from 'graphql-react/public/useWaterfallLoad.js';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

const cacheKey = 'a';
const fetchOptions = {
  method: 'POST',
  headers: {
    Accept: 'application/json',
  },
  body: JSON.stringify({
    query: '{ a }',
  }),
};

export default function IndexPage() {
  const {
    query: { linkHeaderGraphql }
  } = useRouter();

  const cacheValue = useCacheEntry(cacheKey);

  let fetchUri = '${urlGraphql}';

  if (linkHeaderGraphql)
    fetchUri += \`?linkHeader=\${encodeURIComponent(
      linkHeaderGraphql
    )}\`;

  const loadGraphQL = useLoadGraphQL();
  const load = useCallback(
    () => loadGraphQL(cacheKey, fetchUri, fetchOptions),
    [fetchUri]
  );

  useAutoLoad(cacheKey, load);

  const isWaterfallLoading = useWaterfallLoad(cacheKey, load);

  return isWaterfallLoading ? null : cacheValue?.data ? (
    <div id={cacheValue.data.a} />
  ) : cacheValue?.errors ? (
    'Error!'
  ) : (
    <div id="loading" />
  );
}`
              ),
              fs.promises.writeFile(
                secondPagePath,
                `import useAutoLoad from 'graphql-react/public/useAutoLoad.js';
import useCacheEntry from 'graphql-react/public/useCacheEntry.js';
import useLoadGraphQL from 'graphql-react/public/useLoadGraphQL.js';
import useWaterfallLoad from 'graphql-react/public/useWaterfallLoad.js';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

const cacheKey = 'b';
const fetchUri = '${urlGraphql}';
const fetchOptions = {
  method: 'POST',
  headers: {
    Accept: 'application/json',
  },
  body: JSON.stringify({
    query: '{ b }',
  }),
};

export default function SecondPage() {
  const cacheValue = useCacheEntry(cacheKey);
  const loadGraphQL = useLoadGraphQL();
  const load = useCallback(
    () => loadGraphQL(cacheKey, fetchUri, fetchOptions),
    [fetchUri]
  );

  useAutoLoad(cacheKey, load);

  const isWaterfallLoading = useWaterfallLoad(cacheKey, load);

  return isWaterfallLoading ? null : cacheValue?.data ? (
    <div id={cacheValue.data.b} />
  ) : cacheValue?.errors ? (
    'Error!'
  ) : (
    <div id="loading" />
  );
}`
              ),
            ])
          ),
        ]);

        console.log('Installing dependencies…');

        await execFilePromise('npm', ['install'], { cwd: tempDirPath });

        console.log('Installing next-graphql-react dependency…');

        await installFrom(NEXT_GRAPHQL_REACT_PATH, tempDirPath);
      } finally {
        console.groupEnd();
      }

      console.log('Building Next.js…');

      const buildOutput = await execFilePromise('npx', ['next', 'build'], {
        cwd: tempDirPath,
      });

      ok(buildOutput.stdout.includes('Compiled successfully'));

      console.log('Starting Next.js…');

      const { port: portNext, close: closeNext } = await startNext(tempDirPath);

      try {
        const urlNext = `http://localhost:${portNext}`;
        const browser = await puppeteer.launch();

        try {
          const page = await browser.newPage();

          console.group('Testing server side page loads…');

          try {
            const linkHeaderGraphqlForwardable =
              '<https://github.com>; rel=dns-prefetch, <https://github.com>; rel=preconnect, <https://github.com>; rel=prefetch, <https://github.com>; rel=preload, <https://unpkg.com/next-graphql-react@8.0.3/universal/index.js>; rel=modulepreload, <https://github.com>; rel=prerender';
            const linkHeaderGraphQLUnforwardable =
              '<https://github.com>; rel=nonsense';
            const serverSidePageLoadTests = new TestDirector();

            serverSidePageLoadTests.add(
              'Next.js original response `Link` header absent, GraphQL response `Link` header absent.',
              async () => {
                const response = await page.goto(urlNext);

                ok(response.ok());
                strictEqual(response.headers().link, undefined);
                ok(await page.$(`#${MARKER_A}`));
              }
            );

            serverSidePageLoadTests.add(
              'Next.js original response `Link` header absent, GraphQL response `Link` header parsable.',
              async () => {
                const response = await page.goto(
                  `${urlNext}?linkHeaderGraphql=${encodeURIComponent(
                    `${linkHeaderGraphqlForwardable}, ${linkHeaderGraphQLUnforwardable}`
                  )}`
                );

                ok(response.ok());
                strictEqual(
                  response.headers().link,
                  linkHeaderGraphqlForwardable
                );
                ok(await page.$(`#${MARKER_A}`));
              }
            );

            serverSidePageLoadTests.add(
              'Next.js original response `Link` header absent, GraphQL response `Link` header unparsable.',
              async () => {
                const response = await page.goto(
                  `${urlNext}?linkHeaderGraphql=.`
                );

                ok(response.ok());
                strictEqual(response.headers().link, undefined);
                ok(await page.$(`#${MARKER_A}`));
              }
            );

            serverSidePageLoadTests.add(
              'Next.js original response `Link` header parsable, GraphQL response `Link` header absent.',
              async () => {
                const linkHeaderNext =
                  '<https://github.com>; rel=preconnect, <https://github.com>; rel=nonsense';
                const response = await page.goto(
                  `${urlNext}?linkHeaderNext=${encodeURIComponent(
                    linkHeaderNext
                  )}`
                );

                ok(response.ok());
                strictEqual(response.headers().link, linkHeaderNext);
                ok(await page.$(`#${MARKER_A}`));
              }
            );

            serverSidePageLoadTests.add(
              'Next.js original response `Link` header parsable, GraphQL response `Link` header parsable, different.',
              async () => {
                const linkHeaderNext =
                  '<https://github.com/jaydenseric>; rel=preconnect, <https://github.com/jaydenseric>; rel=nonsense';
                const response = await page.goto(
                  `${urlNext}?linkHeaderNext=${encodeURIComponent(
                    linkHeaderNext
                  )}&linkHeaderGraphql=${encodeURIComponent(
                    `${linkHeaderGraphqlForwardable}, ${linkHeaderGraphQLUnforwardable}`
                  )}`
                );

                ok(response.ok());
                strictEqual(
                  response.headers().link,
                  `${linkHeaderNext}, ${linkHeaderGraphqlForwardable}`
                );
                ok(await page.$(`#${MARKER_A}`));
              }
            );

            serverSidePageLoadTests.add(
              'Next.js original response `Link` header parsable, GraphQL response `Link` header parsable, similar.',
              async () => {
                const linkHeader =
                  '<https://github.com>; rel=preconnect, <https://github.com>; rel=nonsense';
                const linkHeaderEncoded = encodeURIComponent(linkHeader);
                const response = await page.goto(
                  `${urlNext}?linkHeaderNext=${linkHeaderEncoded}&linkHeaderGraphql=${linkHeaderEncoded}`
                );

                ok(response.ok());
                strictEqual(response.headers().link, linkHeader);
                ok(await page.$(`#${MARKER_A}`));
              }
            );

            serverSidePageLoadTests.add(
              'Next.js original response `Link` header parsable, GraphQL response `Link` header unparsable.',
              async () => {
                const linkHeaderNext =
                  '<https://github.com>; rel=preconnect, <https://github.com>; rel=nonsense';
                const response = await page.goto(
                  `${urlNext}?linkHeaderNext=${encodeURIComponent(
                    linkHeaderNext
                  )}&linkHeaderGraphql=.`
                );

                ok(response.ok());
                strictEqual(response.headers().link, linkHeaderNext);
                ok(await page.$(`#${MARKER_A}`));
              }
            );

            serverSidePageLoadTests.add(
              'Next.js original response `Link` header unparsable, GraphQL response `Link` header absent.',
              async () => {
                const linkHeaderNext = '.';
                const response = await page.goto(
                  `${urlNext}?linkHeaderNext=${encodeURIComponent(
                    linkHeaderNext
                  )}`
                );

                ok(response.ok());
                strictEqual(response.headers().link, linkHeaderNext);
                ok(await page.$(`#${MARKER_A}`));
              }
            );

            serverSidePageLoadTests.add(
              'Next.js original response `Link` header unparsable, GraphQL response `Link` header parsable.',
              async () => {
                const response = await page.goto(
                  `${urlNext}?linkHeaderNext=.&linkHeaderGraphql=${encodeURIComponent(
                    `${linkHeaderGraphqlForwardable}, ${linkHeaderGraphQLUnforwardable}`
                  )}`
                );

                ok(response.ok());
                strictEqual(
                  response.headers().link,
                  linkHeaderGraphqlForwardable
                );
                ok(await page.$(`#${MARKER_A}`));
              }
            );

            serverSidePageLoadTests.add(
              'Next.js original response `Link` header unparsable, GraphQL response `Link` header unparsable.',
              async () => {
                const response = await page.goto(
                  // The unparsable values have to be different so the can be
                  // separately identified in the final response.
                  `${urlNext}?linkHeaderNext=.&linkHeaderGraphql=-`
                );

                ok(response.ok());
                strictEqual(
                  response.headers().link,
                  // Because there wasn’t a parsable `Link` header to forward
                  // from the GraphQL response, the unparsable original Next.js
                  // one shouldn’t have been replaced in the final response.
                  '.'
                );
                ok(await page.$(`#${MARKER_A}`));
              }
            );

            await serverSidePageLoadTests.run(true);
          } finally {
            console.groupEnd();
          }

          console.log('Testing client side page load…');

          await Promise.all([
            page.click('[href="/second"]'),
            page.waitForNavigation(),
            page.waitForSelector('#loading', { timeout: 1000 }),
            page.waitForSelector(`#${MARKER_B}`, { timeout: 1000 }),
          ]);
        } finally {
          await browser.close();
        }
      } finally {
        closeNext();
      }

      console.log('Testing static HTML export…');

      const exportOutput = await execFilePromise('npx', ['next', 'export'], {
        cwd: tempDirPath,
      });

      ok(exportOutput.stdout.includes('Export successful'));

      const html = await fs.promises.readFile(
        join(tempDirPath, 'out', 'index.html'),
        'utf8'
      );

      ok(html.includes(`id="${MARKER_A}"`));
    });
  } finally {
    closeGraphqlSever();
  }
});

tests.run();
