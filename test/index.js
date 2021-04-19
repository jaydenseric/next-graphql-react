'use strict';

const { TestDirector } = require('test-director');

const tests = new TestDirector();

require('./public/withGraphQLReact.test')(tests);

tests.run();
