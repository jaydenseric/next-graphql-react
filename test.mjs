import TestDirector from "test-director";

import test_withGraphQLReact from "./withGraphQLReact.test.mjs";

const tests = new TestDirector();

test_withGraphQLReact(tests);

tests.run().then(() => {
  // Once Next.js is programmatically started there is no way to gracefully stop
  // it due to how leaky it is. Stopping the Node.js HTTP server is not enough
  // to allow the process to naturally exit. Next.js themselves in their tests
  // use a child process to start Next.js via the CLI, and when they want to
  // stop it they forcibly kill the process and all its children using process
  // IDs. To avoid going to all that trouble here, this process is forced to
  // exit after all the tests are done. The downside is a bug that causes a hung
  // process might not be noticed.
  process.exit(
    // Respect the original exit code.
    process.exitCode
  );
});
