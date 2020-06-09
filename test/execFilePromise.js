'use strict';

const { execFile } = require('child_process');
const { promisify } = require('util');

module.exports = promisify(execFile);
