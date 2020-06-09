'use strict';

const { spawn } = require('child_process');

/**
 * Starts a Next.js server in a child process.
 * @kind function
 * @name startNext
 * @param {string} [cwd] Current working directory to run `npx next start` in (should be the Next.js project directory), defaulting to the process CWD.
 * @returns {Promise<{childProcess: ChildProcess, url: string}>} Resolves the Next.js server child process and URL once it’s ready to accept requests.
 * @ignore
 */
module.exports = function startNext(cwd) {
  return new Promise((resolve, reject) => {
    const onCloseEarly = () => {
      reject(new Error('Next.js failed to start.'));
    };

    const childProcess = spawn('npx', ['next', 'start'], { cwd });

    childProcess.once('error', reject);
    childProcess.once('close', onCloseEarly);

    childProcess.stderr.setEncoding('utf8');
    childProcess.stderr.on('data', (data) => {
      console.error(data);
    });

    childProcess.stdout.setEncoding('utf8');
    childProcess.stdout.on('data', (data) => {
      const match = data.match(/^ready - started server on (.+)$/m);
      if (match) {
        childProcess.off('close', onCloseEarly);
        resolve({ childProcess, url: match[1] });
      }
    });
  });
};
