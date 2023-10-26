// @ts-check

import useAutoLoad from "graphql-react/useAutoLoad.mjs";
import useCacheEntry from "graphql-react/useCacheEntry.mjs";
import useLoadGraphQL from "graphql-react/useLoadGraphQL.mjs";
import useWaterfallLoad from "graphql-react/useWaterfallLoad.mjs";
import { useRouter } from "next/router.js";
import React from "react";

const cacheKey = "a";
const fetchOptions = {
  method: "POST",
  headers: {
    Accept: "application/json",
  },
  body: JSON.stringify({
    query: "{ a }",
  }),
};

/** @typedef {{ a: string }} QueryData */

export default function IndexPage() {
  const {
    query: { linkHeaderGraphql },
  } = useRouter();

  const cacheValue =
    /**
     * @type {import("graphql-react/fetchGraphQL.mjs").FetchGraphQLResult
     *   & { data?: QueryData } | undefined}
     */
    (useCacheEntry(cacheKey));

  let fetchUri = /** @type {string} */ (process.env.NEXT_PUBLIC_GRAPHQL_URL);

  if (typeof linkHeaderGraphql === "string")
    fetchUri += `?linkHeader=${encodeURIComponent(linkHeaderGraphql)}`;

  const loadGraphQL = useLoadGraphQL();
  const load = React.useCallback(
    () => loadGraphQL(cacheKey, fetchUri, fetchOptions),
    [fetchUri, loadGraphQL],
  );

  useAutoLoad(cacheKey, load);

  const isWaterfallLoading = useWaterfallLoad(cacheKey, load);

  return isWaterfallLoading
    ? null
    : cacheValue?.data
    ? React.createElement("div", { id: cacheValue.data.a })
    : cacheValue?.errors
    ? "Error!"
    : React.createElement("div", { id: "loading" });
}
