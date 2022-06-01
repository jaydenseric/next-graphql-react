import useAutoLoad from "graphql-react/useAutoLoad.mjs";
import useCacheEntry from "graphql-react/useCacheEntry.mjs";
import useLoadGraphQL from "graphql-react/useLoadGraphQL.mjs";
import useWaterfallLoad from "graphql-react/useWaterfallLoad.mjs";
import React from "react";
import JsxRuntime from "react/jsx-runtime.js";

const cacheKey = "b";
const fetchUri = process.env.NEXT_PUBLIC_GRAPHQL_URL;
const fetchOptions = {
  method: "POST",
  headers: {
    Accept: "application/json",
  },
  body: JSON.stringify({
    query: "{ b }",
  }),
};

export default function SecondPage() {
  const cacheValue = useCacheEntry(cacheKey);
  const loadGraphQL = useLoadGraphQL();
  const load = React.useCallback(
    () => loadGraphQL(cacheKey, fetchUri, fetchOptions),
    [loadGraphQL]
  );

  useAutoLoad(cacheKey, load);

  const isWaterfallLoading = useWaterfallLoad(cacheKey, load);

  return isWaterfallLoading
    ? null
    : cacheValue?.data
    ? JsxRuntime.jsx("div", { id: cacheValue.data.b })
    : cacheValue?.errors
    ? "Error!"
    : JsxRuntime.jsx("div", { id: "loading" });
}
