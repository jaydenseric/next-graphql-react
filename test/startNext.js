'use strict';

const { spawn } = require('child_process');
const treeKillPromise = require('./treeKillPromise');

/**
 * Starts a Next.js server in a child process.
 * @kind function
 * @name startNext
 * @param {string} [cwd] Current working directory to run `npx next start` in (should be the Next.js project directory), defaulting to the process CWD.
 * @returns {Promise<{stop: Function, url: string}>} Resolves a function to stop the Next.js server process, and the URL once it’s ready to accept requests.
 * @ignore
 */
module.exports = function startNext(cwd) {
  return new Promise((resolve, reject) => {
    const onCloseEarly = () => {
      reject(new Error('Next.js failed to start.'));
    };

    const nextProcess = spawn('npx', ['next', 'start'], { cwd });

    nextProcess.once('error', reject);
    nextProcess.once('close', onCloseEarly);

    nextProcess.stderr.setEncoding('utf8');
    nextProcess.stderr.on('data', (data) => {
      console.error(data);
    });

    nextProcess.stdout.setEncoding('utf8');
    nextProcess.stdout.on('data', (data) => {
      const match = data.match(/^ready - started server on (.+)$/m);
      if (match) {
        nextProcess.off('close', onCloseEarly);
        resolve({
          stop: () => treeKillPromise(nextProcess.pid),
          url: match[1],
        });
      }
    });
  });
};
