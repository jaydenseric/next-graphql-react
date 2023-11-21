// @ts-check

/** @satisfies {import("next").NextConfig} */
const nextConfig = {
  output: /** @type {"export" | undefined} */ (
    process.env.TEST_FIXTURE_NEXT_CONFIG_OUTPUT
  ),
  pageExtensions: ["mjs"],
};

export default nextConfig;
