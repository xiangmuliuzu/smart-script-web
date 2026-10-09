import test from 'node:test'
import assert from 'node:assert/strict'
import { avatarUrl } from '../src/utils/avatarUrl.js'

test('platform paths and historical hosts use the current API proxy', () => {
  const path = '/profile/upload/2026/10/09/avatar.png'
  for (const value of [path, `http://localhost:8080${path}`, `http://10.0.2.2:8080${path}`, `https://old.test/gateway${path}`]) {
    assert.equal(avatarUrl(value, '/dev-api'), `/dev-api${path}`)
    assert.equal(avatarUrl(value, 'https://api.test/gateway/'), `https://api.test/gateway${path}`)
    assert.equal(avatarUrl(value, 'https://api.test/gateway/api/v1'), `https://api.test/gateway${path}`)
  }
  assert.equal(avatarUrl('/profile/avatar/a.jpg', '/prod-api'), '/prod-api/profile/avatar/a.jpg')
})

test('external images and encoded historical filenames remain usable', () => {
  assert.equal(avatarUrl('https://cdn.test/images/avatar.png', '/dev-api'), 'https://cdn.test/images/avatar.png')
  assert.equal(avatarUrl('http://localhost:8080/profile/upload/a%20b.png', '/dev-api'), '/dev-api/profile/upload/a%20b.png')
})

test('empty and unsafe protocols are not rendered', () => {
  for (const value of [null, '', 'data:image/png;base64,abc', 'javascript:alert(1)', '//other.test/a.png', 'http://']) {
    assert.equal(avatarUrl(value, '/dev-api'), '')
  }
})
