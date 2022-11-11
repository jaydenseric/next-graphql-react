// @ts-check

import { ok, strictEqual } from "node:assert";
import { readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

import puppeteer from "puppeteer";
import TestDirector from "test-director";

import execFilePromise from "./test/execFilePromise.mjs";
import listen from "./test/listen.mjs";
import startNext from "./test/startNext.mjs";

/**
 * Adds `withGraphQLReact` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add(
    "`withGraphQLReact` with a Next.js production build and static HTML export.",
    async () => {
      const markerA = "MARKER_A";
      const markerB = "MARKER_B";

      // Dummy GraphQL server with a hardcoded response. The URL query string
      // parameter `linkHeader` can be used to set an arbitrary `Link` header in
      // the response.
      const graphqlSever = createServer((request, response) => {
        /** @type {{ [key: string]: string }} */
        const responseHeaders = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
          "Content-Type": "application/json",
        };

        const { searchParams } = new URL(
          /** @type {string} */ (request.url),
          `http://${request.headers.host}`
        );

        const linkHeader = searchParams.get("linkHeader");

        if (linkHeader) responseHeaders.Link = linkHeader;

        response.writeHead(200, responseHeaders);
        response.write(
          JSON.stringify({
            data: {
              a: markerA,
              b: markerB,
            },
          })
        );
        response.end();
      });

      const { port: portGraphqlSever, close: closeGraphqlSever } = await listen(
        graphqlSever
      );

      try {
        process.env.NEXT_PUBLIC_GRAPHQL_URL = `http://localhost:${portGraphqlSever}`;

        const nextProjectUrl = new URL(
          "./test/fixtures/next-project/",
          import.meta.url
        );
        const nextProjectPath = fileURLToPath(nextProjectUrl);

        console.log("Building Next.js…");

        const buildOutput = await execFilePromise("npx", ["next", "build"], {
          cwd: nextProjectPath,
        });

        ok(buildOutput.stdout.includes("Compiled successfully"));

        try {
          console.log("Starting Next.js…");

          const { port: portNext, close: closeNext } = await startNext(
            nextProjectPath
          );

          try {
            const browser = await puppeteer.launch();

            try {
              const page = await browser.newPage();

              console.group("Testing server side page loads…");

              try {
                const nextServerUrl = `http://localhost:${portNext}`;
                const linkHeaderGraphqlForwardable =
                  "<https://github.com>; rel=dns-prefetch, <https://github.com>; rel=preconnect, <https://github.com>; rel=prefetch, <https://github.com>; rel=preload, <https://unpkg.com/next-graphql-react@8.0.3/universal/index.js>; rel=modulepreload, <https://github.com>; rel=prerender";
                const linkHeaderGraphQLUnforwardable =
                  "<https://github.com>; rel=nonsense";
                const serverSidePageLoadTests = new TestDirector();

                serverSidePageLoadTests.add(
                  "Next.js original response `Link` header absent, GraphQL response `Link` header absent.",
                  async () => {
                    const response = await page.goto(nextServerUrl);

                    ok(response);
                    ok(response.ok());
                    strictEqual(response.headers().link, undefined);
                    ok(await page.$(`#${markerA}`));
                  }
                );

                serverSidePageLoadTests.add(
                  "Next.js original response `Link` header absent, GraphQL response `Link` header parsable.",
                  async () => {
                    const response = await page.goto(
                      `${nextServerUrl}?linkHeaderGraphql=${encodeURIComponent(
                        `${linkHeaderGraphqlForwardable}, ${linkHeaderGraphQLUnforwardable}`
                      )}`
                    );

                    ok(response);
                    ok(response.ok());
                    strictEqual(
                      response.headers().link,
                      linkHeaderGraphqlForwardable
                    );
                    ok(await page.$(`#${markerA}`));
                  }
                );

                serverSidePageLoadTests.add(
                  "Next.js original response `Link` header absent, GraphQL response `Link` header unparsable.",
                  async () => {
                    const response = await page.goto(
                      `${nextServerUrl}?linkHeaderGraphql=.`
                    );

                    ok(response);
                    ok(response.ok());
                    strictEqual(response.headers().link, undefined);
                    ok(await page.$(`#${markerA}`));
                  }
                );

                serverSidePageLoadTests.add(
                  "Next.js original response `Link` header parsable, GraphQL response `Link` header absent.",
                  async () => {
                    const linkHeaderNext =
                      "<https://github.com>; rel=preconnect, <https://github.com>; rel=nonsense";
                    const response = await page.goto(
                      `${nextServerUrl}?linkHeaderNext=${encodeURIComponent(
                        linkHeaderNext
                      )}`
                    );

                    ok(response);
                    ok(response.ok());
                    strictEqual(response.headers().link, linkHeaderNext);
                    ok(await page.$(`#${markerA}`));
                  }
                );

                serverSidePageLoadTests.add(
                  "Next.js original response `Link` header parsable, GraphQL response `Link` header parsable, different.",
                  async () => {
                    const linkHeaderNext =
                      "<https://github.com/jaydenseric>; rel=preconnect, <https://github.com/jaydenseric>; rel=nonsense";
                    const response = await page.goto(
                      `${nextServerUrl}?linkHeaderNext=${encodeURIComponent(
                        linkHeaderNext
                      )}&linkHeaderGraphql=${encodeURIComponent(
                        `${linkHeaderGraphqlForwardable}, ${linkHeaderGraphQLUnforwardable}`
                      )}`
                    );

                    ok(response);
                    ok(response.ok());
                    strictEqual(
                      response.headers().link,
                      `${linkHeaderNext}, ${linkHeaderGraphqlForwardable}`
                    );
                    ok(await page.$(`#${markerA}`));
                  }
                );

                serverSidePageLoadTests.add(
                  "Next.js original response `Link` header parsable, GraphQL response `Link` header parsable, similar.",
                  async () => {
                    const linkHeader =
                      "<https://github.com>; rel=preconnect, <https://github.com>; rel=nonsense";
                    const linkHeaderEncoded = encodeURIComponent(linkHeader);
                    const response = await page.goto(
                      `${nextServerUrl}?linkHeaderNext=${linkHeaderEncoded}&linkHeaderGraphql=${linkHeaderEncoded}`
                    );

                    ok(response);
                    ok(response.ok());
                    strictEqual(response.headers().link, linkHeader);
                    ok(await page.$(`#${markerA}`));
                  }
                );

                serverSidePageLoadTests.add(
                  "Next.js original response `Link` header parsable, GraphQL response `Link` header unparsable.",
                  async () => {
                    const linkHeaderNext =
                      "<https://github.com>; rel=preconnect, <https://github.com>; rel=nonsense";
                    const response = await page.goto(
                      `${nextServerUrl}?linkHeaderNext=${encodeURIComponent(
                        linkHeaderNext
                      )}&linkHeaderGraphql=.`
                    );

                    ok(response);
                    ok(response.ok());
                    strictEqual(response.headers().link, linkHeaderNext);
                    ok(await page.$(`#${markerA}`));
                  }
                );

                serverSidePageLoadTests.add(
                  "Next.js original response `Link` header unparsable, GraphQL response `Link` header absent.",
                  async () => {
                    const linkHeaderNext = ".";
                    const response = await page.goto(
                      `${nextServerUrl}?linkHeaderNext=${encodeURIComponent(
                        linkHeaderNext
                      )}`
                    );

                    ok(response);
                    ok(response.ok());
                    strictEqual(response.headers().link, linkHeaderNext);
                    ok(await page.$(`#${markerA}`));
                  }
                );

                serverSidePageLoadTests.add(
                  "Next.js original response `Link` header unparsable, GraphQL response `Link` header parsable.",
                  async () => {
                    const response = await page.goto(
                      `${nextServerUrl}?linkHeaderNext=.&linkHeaderGraphql=${encodeURIComponent(
                        `${linkHeaderGraphqlForwardable}, ${linkHeaderGraphQLUnforwardable}`
                      )}`
                    );

                    ok(response);
                    ok(response.ok());
                    strictEqual(
                      response.headers().link,
                      linkHeaderGraphqlForwardable
                    );
                    ok(await page.$(`#${markerA}`));
                  }
                );

                serverSidePageLoadTests.add(
                  "Next.js original response `Link` header unparsable, GraphQL response `Link` header unparsable.",
                  async () => {
                    const response = await page.goto(
                      // The unparsable values have to be different so the
                      // can be separately identified in the final response.
                      `${nextServerUrl}?linkHeaderNext=.&linkHeaderGraphql=-`
                    );

                    ok(response);
                    ok(response.ok());
                    strictEqual(
                      response.headers().link,
                      // Because there wasn’t a parsable `Link` header to
                      // forward from the GraphQL response, the unparsable
                      // original Next.js one shouldn’t have been replaced
                      // in the final response.
                      "."
                    );
                    ok(await page.$(`#${markerA}`));
                  }
                );

                await serverSidePageLoadTests.run(true);
              } finally {
                console.groupEnd();
              }

              console.log("Testing client side page load…");

              await Promise.all([
                page.click('[href="/second"]'),
                page.waitForNavigation(),
                page.waitForSelector("#loading", { timeout: 1000 }),
                page.waitForSelector(`#${markerB}`, { timeout: 1000 }),
              ]);
            } finally {
              await browser.close();
            }
          } finally {
            closeNext();
          }

          console.log("Testing static HTML export…");

          const nextExportOutDirName = ".next-export";
          const nextExportOutput = await execFilePromise(
            "npx",
            ["next", "export", "-o", nextExportOutDirName],
            { cwd: nextProjectPath }
          );

          ok(nextExportOutput.stdout.includes("Export successful"));

          const nextExportOutDirUrl = new URL(
            `${nextExportOutDirName}/`,
            nextProjectUrl
          );

          try {
            const html = await readFile(
              new URL(`index.html`, nextExportOutDirUrl),
              "utf8"
            );

            ok(html.includes(`id="${markerA}"`));
          } finally {
            await rm(nextExportOutDirUrl, {
              force: true,
              recursive: true,
            });
          }
        } finally {
          await rm(new URL(".next", nextProjectUrl), {
            force: true,
            recursive: true,
          });
        }
      } finally {
        closeGraphqlSever();
      }
    }
  );
};
