// @ts-check

import useAutoLoad from "graphql-react/useAutoLoad.mjs";
import useCacheEntry from "graphql-react/useCacheEntry.mjs";
import useLoadGraphQL from "graphql-react/useLoadGraphQL.mjs";
import useWaterfallLoad from "graphql-react/useWaterfallLoad.mjs";
import React from "react";

const cacheKey = "b";
const fetchUri = /** @type {string} */ (process.env.NEXT_PUBLIC_GRAPHQL_URL);
const fetchOptions = {
  method: "POST",
  headers: {
    Accept: "application/json",
  },
  body: JSON.stringify({
    query: "{ b }",
  }),
};

/** @typedef {{ b: string }} QueryData */

export default function SecondPage() {
  const cacheValue =
    /**
     * @type {import("graphql-react/fetchGraphQL.mjs").FetchGraphQLResult
     *   & { data?: QueryData } | undefined}
     */
    (useCacheEntry(cacheKey));
  const loadGraphQL = useLoadGraphQL();
  const load = React.useCallback(
    () => loadGraphQL(cacheKey, fetchUri, fetchOptions),
    [loadGraphQL],
  );

  useAutoLoad(cacheKey, load);

  const isWaterfallLoading = useWaterfallLoad(cacheKey, load);

  return isWaterfallLoading
    ? null
    : cacheValue?.data
    ? React.createElement("div", { id: cacheValue.data.b })
    : cacheValue?.errors
    ? "Error!"
    : React.createElement("div", { id: "loading" });
}
