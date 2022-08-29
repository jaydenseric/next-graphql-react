// @ts-check

"use strict";

if (typeof window === "undefined") {
  if (!("performance" in globalThis))
    // @ts-ignore This isn’t a perfect polyfill.
    globalThis.performance = require("perf_hooks").performance;

  if (!("EventTarget" in globalThis))
    globalThis.EventTarget = require("event-target-shim").EventTarget;

  if (!("Event" in globalThis))
    globalThis.Event = require("event-target-shim").Event;

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

  require("abort-controller/polyfill");
}
