// @ts-check

import { ok, strictEqual } from "node:assert";
import { readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import puppeteer from "puppeteer";

import execFilePromise from "./test/execFilePromise.mjs";
import listen from "./test/listen.mjs";
import startNext from "./test/startNext.mjs";

describe("Function `withGraphQLReact`.", { concurrency: true }, async () => {
  const markerA = "MARKER_A";
  const markerB = "MARKER_B";

  /**
   * Dummy GraphQL server with a hardcoded response. The URL query string
   * parameter `linkHeader` can be used to set an arbitrary `Link` header in the
   * response.
   */
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
      `http://${request.headers.host}`,
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
      }),
    );
    response.end();
  });

  const { port: portGraphqlSever, close: closeGraphqlSever } =
    await listen(graphqlSever);

  after(() => {
    closeGraphqlSever();
  });

  process.env.NEXT_PUBLIC_GRAPHQL_URL = `http://localhost:${portGraphqlSever}`;

  const nextProjectUrl = new URL(
    "./test/fixtures/next-project/",
    import.meta.url,
  );
  const nextProjectPath = fileURLToPath(nextProjectUrl);
  const buildOutput = await execFilePromise("npx", ["next", "build"], {
    cwd: nextProjectPath,
  });

  ok(buildOutput.stdout.includes("Compiled successfully"));

  after(async () => {
    await rm(new URL(".next", nextProjectUrl), {
      force: true,
      recursive: true,
    });
  });

  after(() => {
    // Once Next.js is programmatically started there is no way to gracefully
    // stop it due to how leaky it is. Stopping the Node.js HTTP server is not
    // enough to allow the process to naturally exit. Next.js themselves in
    // their tests use a child process to start Next.js via the CLI, and when
    // they want to stop it they forcibly kill the process and all its children
    // using process IDs. To avoid going to all that trouble here, this process
    // is forced to exit after all the tests are done. The downside is a bug
    // that causes a hung process might not be noticed.
    process.exit(
      // Respect the original exit code.
      process.exitCode,
    );
  });

  describe("Served.", { concurrency: true }, async () => {
    const { port: portNext, close: closeNext } =
      await startNext(nextProjectPath);

    after(() => {
      closeNext();
    });

    const browser = await puppeteer.launch({
      headless: "new",
    });

    after(async () => {
      await browser.close();
    });

    const nextServerUrl = `http://localhost:${portNext}`;

    describe("Server side page loads.", { concurrency: true }, () => {
      const linkHeaderGraphqlForwardable =
        "<https://github.com>; rel=dns-prefetch, <https://github.com>; rel=preconnect, <https://github.com>; rel=prefetch, <https://github.com>; rel=preload, <https://unpkg.com/next-graphql-react@8.0.3/universal/index.js>; rel=modulepreload, <https://github.com>; rel=prerender";
      const linkHeaderGraphQLUnforwardable =
        "<https://github.com>; rel=nonsense";

      it("Next.js original response `Link` header absent, GraphQL response `Link` header absent.", async () => {
        const page = await browser.newPage();

        try {
          const response = await page.goto(nextServerUrl);

          ok(response);
          ok(response.ok());
          strictEqual(response.headers().link, undefined);
          ok(await page.$(`#${markerA}`));
        } finally {
          await page.close();
        }
      });

      it("Next.js original response `Link` header absent, GraphQL response `Link` header parsable.", async () => {
        const page = await browser.newPage();

        try {
          const response = await page.goto(
            `${nextServerUrl}?linkHeaderGraphql=${encodeURIComponent(
              `${linkHeaderGraphqlForwardable}, ${linkHeaderGraphQLUnforwardable}`,
            )}`,
          );

          ok(response);
          ok(response.ok());
          strictEqual(response.headers().link, linkHeaderGraphqlForwardable);
          ok(await page.$(`#${markerA}`));
        } finally {
          await page.close();
        }
      });

      it("Next.js original response `Link` header absent, GraphQL response `Link` header unparsable.", async () => {
        const page = await browser.newPage();

        try {
          const response = await page.goto(
            `${nextServerUrl}?linkHeaderGraphql=.`,
          );

          ok(response);
          ok(response.ok());
          strictEqual(response.headers().link, undefined);
          ok(await page.$(`#${markerA}`));
        } finally {
          await page.close();
        }
      });

      it("Next.js original response `Link` header parsable, GraphQL response `Link` header absent.", async () => {
        const page = await browser.newPage();

        try {
          const linkHeaderNext =
            "<https://github.com>; rel=preconnect, <https://github.com>; rel=nonsense";
          const response = await page.goto(
            `${nextServerUrl}?linkHeaderNext=${encodeURIComponent(
              linkHeaderNext,
            )}`,
          );

          ok(response);
          ok(response.ok());
          strictEqual(response.headers().link, linkHeaderNext);
          ok(await page.$(`#${markerA}`));
        } finally {
          await page.close();
        }
      });

      it("Next.js original response `Link` header parsable, GraphQL response `Link` header parsable, different.", async () => {
        const page = await browser.newPage();

        try {
          const linkHeaderNext =
            "<https://github.com/jaydenseric>; rel=preconnect, <https://github.com/jaydenseric>; rel=nonsense";
          const response = await page.goto(
            `${nextServerUrl}?linkHeaderNext=${encodeURIComponent(
              linkHeaderNext,
            )}&linkHeaderGraphql=${encodeURIComponent(
              `${linkHeaderGraphqlForwardable}, ${linkHeaderGraphQLUnforwardable}`,
            )}`,
          );

          ok(response);
          ok(response.ok());
          strictEqual(
            response.headers().link,
            `${linkHeaderNext}, ${linkHeaderGraphqlForwardable}`,
          );
          ok(await page.$(`#${markerA}`));
        } finally {
          await page.close();
        }
      });

      it("Next.js original response `Link` header parsable, GraphQL response `Link` header parsable, similar.", async () => {
        const page = await browser.newPage();

        try {
          const linkHeader =
            "<https://github.com>; rel=preconnect, <https://github.com>; rel=nonsense";
          const linkHeaderEncoded = encodeURIComponent(linkHeader);
          const response = await page.goto(
            `${nextServerUrl}?linkHeaderNext=${linkHeaderEncoded}&linkHeaderGraphql=${linkHeaderEncoded}`,
          );

          ok(response);
          ok(response.ok());
          strictEqual(response.headers().link, linkHeader);
          ok(await page.$(`#${markerA}`));
        } finally {
          await page.close();
        }
      });

      it("Next.js original response `Link` header parsable, GraphQL response `Link` header unparsable.", async () => {
        const page = await browser.newPage();

        try {
          const linkHeaderNext =
            "<https://github.com>; rel=preconnect, <https://github.com>; rel=nonsense";
          const response = await page.goto(
            `${nextServerUrl}?linkHeaderNext=${encodeURIComponent(
              linkHeaderNext,
            )}&linkHeaderGraphql=.`,
          );

          ok(response);
          ok(response.ok());
          strictEqual(response.headers().link, linkHeaderNext);
          ok(await page.$(`#${markerA}`));
        } finally {
          await page.close();
        }
      });

      it("Next.js original response `Link` header unparsable, GraphQL response `Link` header absent.", async () => {
        const page = await browser.newPage();

        try {
          const linkHeaderNext = ".";
          const response = await page.goto(
            `${nextServerUrl}?linkHeaderNext=${encodeURIComponent(
              linkHeaderNext,
            )}`,
          );

          ok(response);
          ok(response.ok());
          strictEqual(response.headers().link, linkHeaderNext);
          ok(await page.$(`#${markerA}`));
        } finally {
          await page.close();
        }
      });

      it("Next.js original response `Link` header unparsable, GraphQL response `Link` header parsable.", async () => {
        const page = await browser.newPage();

        try {
          const response = await page.goto(
            `${nextServerUrl}?linkHeaderNext=.&linkHeaderGraphql=${encodeURIComponent(
              `${linkHeaderGraphqlForwardable}, ${linkHeaderGraphQLUnforwardable}`,
            )}`,
          );

          ok(response);
          ok(response.ok());
          strictEqual(response.headers().link, linkHeaderGraphqlForwardable);
          ok(await page.$(`#${markerA}`));
        } finally {
          await page.close();
        }
      });

      it("Next.js original response `Link` header unparsable, GraphQL response `Link` header unparsable.", async () => {
        const page = await browser.newPage();

        try {
          const response = await page.goto(
            // The unparsable values have to be different so the can be
            // separately identified in the final response.
            `${nextServerUrl}?linkHeaderNext=.&linkHeaderGraphql=-`,
          );

          ok(response);
          ok(response.ok());
          strictEqual(
            response.headers().link,
            // Because there wasn’t a parsable `Link` header to forward from
            // the GraphQL response, the unparsable original Next.js one
            // shouldn’t have been replaced in the final response.
            ".",
          );
          ok(await page.$(`#${markerA}`));
        } finally {
          await page.close();
        }
      });
    });

    it("Client side page load.", async () => {
      const page = await browser.newPage();

      try {
        const response = await page.goto(nextServerUrl);

        ok(response);
        ok(response.ok());

        await Promise.all([
          page.click('[href="/second"]'),
          page.waitForNavigation(),
          page.waitForSelector("#loading", { timeout: 1000 }),
          page.waitForSelector(`#${markerB}`, { timeout: 1000 }),
        ]);
      } finally {
        await page.close();
      }
    });
  });

  it("Static HTML export.", async () => {
    const nextExportOutDirName = ".next-export";
    const nextExportOutput = await execFilePromise(
      "npx",
      ["next", "export", "-o", nextExportOutDirName],
      { cwd: nextProjectPath },
    );

    ok(nextExportOutput.stdout.includes("Export successful"));

    const nextExportOutDirUrl = new URL(
      `${nextExportOutDirName}/`,
      nextProjectUrl,
    );

    try {
      const html = await readFile(
        new URL(`index.html`, nextExportOutDirUrl),
        "utf8",
      );

      ok(html.includes(`id="${markerA}"`));
    } finally {
      await rm(nextExportOutDirUrl, {
        force: true,
        recursive: true,
      });
    }
  });
});
