import TestDirector from 'test-director';
import testWithGraphQLReact from './public/withGraphQLReact.test.mjs';

const tests = new TestDirector();

testWithGraphQLReact(tests);

tests.run();
