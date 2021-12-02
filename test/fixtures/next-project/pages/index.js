import useAutoLoad from 'graphql-react/useAutoLoad.mjs';
import useCacheEntry from 'graphql-react/useCacheEntry.mjs';
import useLoadGraphQL from 'graphql-react/useLoadGraphQL.mjs';
import useWaterfallLoad from 'graphql-react/useWaterfallLoad.mjs';
import { useRouter } from 'next/router.js';
import React from 'react';
import JsxRuntime from 'react/jsx-runtime.js';

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
    query: { linkHeaderGraphql },
  } = useRouter();

  const cacheValue = useCacheEntry(cacheKey);

  let fetchUri = process.env.NEXT_PUBLIC_GRAPHQL_URL;

  if (linkHeaderGraphql)
    fetchUri += `?linkHeader=${encodeURIComponent(linkHeaderGraphql)}`;

  const loadGraphQL = useLoadGraphQL();
  const load = React.useCallback(
    () => loadGraphQL(cacheKey, fetchUri, fetchOptions),
    [fetchUri, loadGraphQL]
  );

  useAutoLoad(cacheKey, load);

  const isWaterfallLoading = useWaterfallLoad(cacheKey, load);

  return isWaterfallLoading
    ? null
    : cacheValue?.data
    ? JsxRuntime.jsx('div', { id: cacheValue.data.a })
    : cacheValue?.errors
    ? 'Error!'
    : JsxRuntime.jsx('div', { id: 'loading' });
}
