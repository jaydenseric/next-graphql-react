import t from 'tap'
import { mergeLinkHeaders } from '../server/mergeLinkHeaders'

t.test('mergeLinkHeaders() simple', t => {
  t.equal(
    mergeLinkHeaders(['<a>; rel=preload; as=image', '<b>; rel=meta']),
    '<a>; rel=preload; as=image, <b>; rel=meta',
    'Return.'
  )
  t.end()
})

t.test('mergeLinkHeaders() duplicate link, identical', t => {
  t.equal(
    mergeLinkHeaders([
      '<a>; rel=preload; as=image',
      '<a>; rel=preload; as=image'
    ]),
    '<a>; rel=preload; as=image',
    'Return.'
  )
  t.end()
})

t.test('mergeLinkHeaders() duplicate link, different', t => {
  t.equal(
    mergeLinkHeaders(['<a>; rel=preload; as=image', '<a>; rel=meta']),
    '<a>; rel=meta',
    'Return.'
  )
  t.end()
})

t.test('mergeLinkHeaders() with an falsy header value', t => {
  t.equal(
    mergeLinkHeaders(['<a>; rel=preload; as=image', undefined]),
    '<a>; rel=preload; as=image',
    'Return.'
  )
  t.end()
})

t.test('mergeLinkHeaders() with an empty array', t => {
  t.equal(mergeLinkHeaders([]), '', 'Return.')
  t.end()
})
