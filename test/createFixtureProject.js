/* eslint-disable no-console */

'use strict';

const fs = require('fs');
const { join, resolve } = require('path');
const { installFrom } = require('install-from');
const execFilePromise = require('./execFilePromise');

const NEXT_GRAPHQL_REACT_PATH = resolve(__dirname, '..');

/**
 * Creates a Next.js project using `graphql-react` and `next-graphql-react` in
 * a temporary directory for testing purposes.
 * @kind function
 * @name createFixtureProject
 * @param {string} tempDirPath Temporary directory path to create the project in.
 * @param {string} graphqlUrl GraphQL endpoint URL.
 * @returns {Promise<void>} Resolves once the project has been created.
 * @ignore
 */
module.exports = async function createFixtureProject(tempDirPath, graphqlUrl) {
  console.group('Creating fixture project…');

  console.log('Creating files…');

  const packageJsonPath = join(tempDirPath, 'package.json');
  const pagesPath = join(tempDirPath, 'pages');
  const appPath = join(pagesPath, '_app.js');
  const indexPagePath = join(pagesPath, 'index.js');
  const secondPagePath = join(pagesPath, 'second.js');

  await fs.promises.writeFile(
    packageJsonPath,
    `{
  "private": true,
  "dependencies": {
    "graphql-react": "^11.0.1",
    "next": "^9.4.1",
    "react": "^16.13.1",
    "react-dom": "^16.13.1"
  }
}`
  );

  await fs.promises.mkdir(pagesPath);

  await fs.promises.writeFile(
    appPath,
    `import { GraphQLProvider } from 'graphql-react';
import { withGraphQLApp } from 'next-graphql-react';
import Link from 'next/link'

const App = ({ Component, pageProps, graphql }) => (
  <GraphQLProvider graphql={graphql}>
    <Link href="/second" passHref>
      <a>Second</a>
    </Link>
    <Component {...pageProps} />
  </GraphQLProvider>
);

export default withGraphQLApp(App);`
  );

  await fs.promises.writeFile(
    indexPagePath,
    `import { useGraphQL } from 'graphql-react';

export default function IndexPage() {
  const { loading, cacheValue = {} } = useGraphQL({
    loadOnMount: true,
    fetchOptionsOverride(options) {
      options.url = '${graphqlUrl}';
    },
    operation: {
      query: '{ a }',
    },
  });

  return cacheValue.data ? (
    <div id={cacheValue.data.a} />
  ) : loading ? (
    <div id="loading" />
  ) : (
    'Error!'
  );
}`
  );

  await fs.promises.writeFile(
    secondPagePath,
    `import { useGraphQL } from 'graphql-react';

export default function SecondPage() {
  const { loading, cacheValue = {} } = useGraphQL({
    loadOnMount: true,
    fetchOptionsOverride(options) {
      options.url = '${graphqlUrl}';
    },
    operation: {
      query: '{ b }',
    },
  });

  return cacheValue.data ? (
    <div id={cacheValue.data.b} />
  ) : loading ? (
    <div id="loading" />
  ) : (
    'Error!'
  );
}`
  );

  console.log('Installing dependencies…');

  await execFilePromise('npm', ['install'], {
    cwd: tempDirPath,
  });

  console.log('Installing next-graphql-react dependency…');

  await installFrom(NEXT_GRAPHQL_REACT_PATH, tempDirPath);

  console.groupEnd();
};
