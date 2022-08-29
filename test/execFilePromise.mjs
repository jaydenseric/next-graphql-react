// @ts-check

import { execFile } from "node:child_process";
import { promisify } from "node:util";

export default promisify(execFile);
