/**
 * Merges links in multiple HTTP `Link` header values. Later links override
 * earlier links with the same URL.
 * @param {Array<string>} headers HTTP `Link` header values.
 * @returns {string} Merged HTTP `Link` header value.
 * @ignore
 */
export const mergeLinkHeaders = headers => {
  const links = {}

  headers.forEach(header => {
    // Falsy headers get skipped.
    if (header)
      header.split(/\s*,\s*/).forEach(link => {
        const [, url] = link.match(/<([^>]+)>/)
        links[url] = link
      })
  })

  return Object.values(links).join(', ')
}
