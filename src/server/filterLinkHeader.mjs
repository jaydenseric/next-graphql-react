/**
 * Filters links in a HTTP `Link` header value.
 * @param {string} header HTTP `Link` header value.
 * @param {string} rel Desired link `rel` value.
 * @returns {string} Filtered HTTP `Link` header value.
 * @ignore
 */
export const filterLinkHeader = (header, rel = 'preload') =>
  header
    .split(/\s*,\s*/)
    .filter(link => link.split(/\s*;\s*/).some(part => part === `rel=${rel}`))
    .join(', ')
