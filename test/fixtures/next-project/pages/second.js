'use strict';

const useAutoLoad = require('graphql-react/public/useAutoLoad.js');
const useCacheEntry = require('graphql-react/public/useCacheEntry.js');
const useLoadGraphQL = require('graphql-react/public/useLoadGraphQL.js');
const useWaterfallLoad = require('graphql-react/public/useWaterfallLoad.js');
const { useCallback } = require('react');
const { jsx } = require('react/jsx-runtime');

const cacheKey = 'b';
const fetchUri = process.env.NEXT_PUBLIC_GRAPHQL_URL;
const fetchOptions = {
  method: 'POST',
  headers: {
    Accept: 'application/json',
  },
  body: JSON.stringify({
    query: '{ b }',
  }),
};

module.exports = function SecondPage() {
  const cacheValue = useCacheEntry(cacheKey);
  const loadGraphQL = useLoadGraphQL();
  const load = useCallback(
    () => loadGraphQL(cacheKey, fetchUri, fetchOptions),
    [loadGraphQL]
  );

  useAutoLoad(cacheKey, load);

  const isWaterfallLoading = useWaterfallLoad(cacheKey, load);

  return isWaterfallLoading
    ? null
    : cacheValue?.data
    ? jsx('div', { id: cacheValue.data.b })
    : cacheValue?.errors
    ? 'Error!'
    : jsx('div', { id: 'loading' });
};
