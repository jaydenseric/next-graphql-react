import { execFile } from "child_process";
import { promisify } from "util";

export default promisify(execFile);
