import t from 'tap'
import { filterLinkHeader } from '../server/filterLinkHeader'

t.test('filterLinkHeader() specified rel', t => {
  t.equal(
    filterLinkHeader(
      '<a>; rel=preload; as=image, <b>; rel=meta, <c>; rel=preload; as=image',
      'meta'
    ),
    '<b>; rel=meta',
    'Return.'
  )
  t.end()
})

t.test('filterLinkHeader() default rel', t => {
  t.equal(
    filterLinkHeader('<a>; rel=preload; as=image, <b>; rel=meta'),
    '<a>; rel=preload; as=image',
    'Return.'
  )
  t.end()
})

t.test('filterLinkHeader() with no results', t => {
  t.equal(filterLinkHeader('<a>; rel=preload; as=image', 'meta'), '', 'Return.')
  t.end()
})
