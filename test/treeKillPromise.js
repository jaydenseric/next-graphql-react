'use strict';

const { promisify } = require('util');
const treeKill = require('tree-kill');

module.exports = promisify(treeKill);
