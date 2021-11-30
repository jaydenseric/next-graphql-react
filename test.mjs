import TestDirector from 'test-director';
import test_withGraphQLReact from './withGraphQLReact.test.mjs';

const tests = new TestDirector();

test_withGraphQLReact(tests);

tests.run();
