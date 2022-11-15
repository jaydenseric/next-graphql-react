// @ts-check

/**
 * Normalize a CJS module default import value that may have a `default`
 * property, preserving the type for the various ways TypeScript may be
 * configured.
 * @template T Imported CJS module type.
 * @param {T} value Imported CJS module.
 * @returns {T extends { default: any } ? T["default"] : T} Normalized default
 *   import value.
 */
export default function cjsDefaultImport(value) {
  return typeof value === "object" && value && "default" in value
    ? /** @type {{ default: any }} */ (value).default
    : value;
}
