/* eslint-disable no-console */

'use strict';

const { ok } = require('assert');
const fs = require('fs');
const { createServer } = require('http');
const { join } = require('path');
const { disposableDirectory } = require('disposable-directory');
const puppeteer = require('puppeteer');
const { TestDirector } = require('test-director');
const createFixtureProject = require('./createFixtureProject');
const execFilePromise = require('./execFilePromise');
const listen = require('./listen');
const startNext = require('./startNext');

const MARKER_A = 'MARKER_A';
const MARKER_B = 'MARKER_B';

// Dummy GraphQL server with a hardcoded response.
const dummyGraphQLSever = createServer((request, response) => {
  response.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept',
    'Content-Type': 'application/json',
  });
  response.write(
    JSON.stringify({
      data: {
        a: MARKER_A,
        b: MARKER_B,
      },
    })
  );
  response.end();
});

const tests = new TestDirector();

tests.add('Next.js production build and static HTML export.', async () => {
  const { port, close } = await listen(dummyGraphQLSever);

  try {
    await disposableDirectory(async (tempDirPath) => {
      await createFixtureProject(tempDirPath, `http://localhost:${port}`);

      console.log('Building Next.js…');

      const buildOutput = await execFilePromise('npx', ['next', 'build'], {
        cwd: tempDirPath,
      });

      ok(buildOutput.stdout.includes('Compiled successfully'));

      console.group('Starting Next.js…');

      const { stop, url } = await startNext(tempDirPath);

      console.groupEnd();

      try {
        const browser = await puppeteer.launch();

        try {
          const page = await browser.newPage();

          console.log('Testing server side page load…');

          const response = await page.goto(url);

          ok(response.ok());
          ok(await page.$(`#${MARKER_A}`));

          console.log('Testing client side page load…');

          await Promise.all([
            page.click('[href="/second"]'),
            page.waitForNavigation(),
            page.waitForSelector('#loading', { timeout: 1000 }),
            page.waitForSelector(`#${MARKER_B}`, { timeout: 1000 }),
          ]);
        } finally {
          await browser.close();
        }
      } finally {
        await stop();
      }

      console.log('Testing static HTML export…');

      const exportOutput = await execFilePromise('npx', ['next', 'export'], {
        cwd: tempDirPath,
      });

      ok(exportOutput.stdout.includes('Export successful'));

      const html = await fs.promises.readFile(
        join(tempDirPath, 'out', 'index.html'),
        'utf8'
      );

      ok(html.includes(`id="${MARKER_A}"`));
    });
  } finally {
    close();
  }
});

tests.run();
