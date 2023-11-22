// @ts-check

import { deepStrictEqual, strictEqual } from "node:assert";
import { describe, it } from "node:test";

import cjsDefaultImport from "./cjsDefaultImport.mjs";

describe("Function `cjsDefaultImport`.", { concurrency: true }, () => {
  describe("Argument 1 `value`.", { concurrency: true }, () => {
    it("Non object.", () => {
      const value = false;

      strictEqual(cjsDefaultImport(value), value);
    });

    describe("Object.", { concurrency: true }, () => {
      it("Property `default` absent.", () => {
        const value = Object.freeze({ a: 1 });

        deepStrictEqual(cjsDefaultImport(value), value);
      });

      it("Property `default` present.", () => {
        const value = Object.freeze({
          default: Object.freeze({ a: 1 }),
        });

        deepStrictEqual(cjsDefaultImport(value), value.default);
      });
    });
  });
});
