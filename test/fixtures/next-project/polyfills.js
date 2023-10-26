// @ts-check

"use strict";

if (typeof window === "undefined") {
  if (!("CustomEvent" in globalThis))
    // @ts-ignore This isn’t a perfect polyfill.
    globalThis.CustomEvent =
      /**
       * @template [T=unknown]
       * @type {globalThis.CustomEvent<T>}
       */
      class CustomEvent extends Event {
        /**
         * @param {string} eventName
         * @param {CustomEventInit<T>} [options]
         */
        constructor(eventName, options = {}) {
          // Workaround a TypeScript bug:
          // https://github.com/microsoft/TypeScript/issues/50286
          const { detail, ...eventOptions } = options;
          super(eventName, eventOptions);
          if (detail) this.detail = detail;
        }
      };
}
