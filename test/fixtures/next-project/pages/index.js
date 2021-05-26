'use strict';

const useAutoLoad = require('graphql-react/public/useAutoLoad.js');
const useCacheEntry = require('graphql-react/public/useCacheEntry.js');
const useLoadGraphQL = require('graphql-react/public/useLoadGraphQL.js');
const useWaterfallLoad = require('graphql-react/public/useWaterfallLoad.js');
const { useRouter } = require('next/router');
const { useCallback } = require('react');
const { jsx } = require('react/jsx-runtime');

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

module.exports = function IndexPage() {
  const {
    query: { linkHeaderGraphql },
  } = useRouter();

  const cacheValue = useCacheEntry(cacheKey);

  let fetchUri = process.env.NEXT_PUBLIC_GRAPHQL_URL;

  if (linkHeaderGraphql)
    fetchUri += `?linkHeader=${encodeURIComponent(linkHeaderGraphql)}`;

  const loadGraphQL = useLoadGraphQL();
  const load = useCallback(
    () => loadGraphQL(cacheKey, fetchUri, fetchOptions),
    [fetchUri, loadGraphQL]
  );

  useAutoLoad(cacheKey, load);

  const isWaterfallLoading = useWaterfallLoad(cacheKey, load);

  return isWaterfallLoading
    ? null
    : cacheValue?.data
    ? jsx('div', { id: cacheValue.data.a })
    : cacheValue?.errors
    ? 'Error!'
    : jsx('div', { id: 'loading' });
};
