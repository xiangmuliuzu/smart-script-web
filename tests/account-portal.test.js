import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ADMIN_ACCOUNT_TYPE,
  USER_PORTAL_HOME,
  isAdminType,
  isUserType,
  isKnownAccountType,
  homePathFor,
  isUserPortalPath,
  safePortalRedirect
} from '../src/utils/account.js'

test('account type classification matches backend AppAdminConstants', () => {
  assert.equal(ADMIN_ACCOUNT_TYPE, '00')
  for (const t of ['01', '02', '03']) {
    assert.ok(isUserType(t), `${t} must be user portal type`)
    assert.ok(isKnownAccountType(t))
    assert.ok(!isAdminType(t))
  }
  assert.ok(isAdminType('00'))
  assert.ok(!isUserType('00'))
  assert.ok(!isKnownAccountType('99'))
  assert.ok(!isKnownAccountType(''))
  assert.ok(!isKnownAccountType(undefined))
})

test('homePathFor routes user types to PC portal and admin to root', () => {
  for (const t of ['01', '02', '03']) {
    assert.equal(homePathFor(t), USER_PORTAL_HOME)
  }
  assert.equal(homePathFor('00'), '/')
  assert.equal(homePathFor(undefined), '/')
})

test('isUserPortalPath only accepts /pc/ prefix', () => {
  assert.ok(isUserPortalPath('/pc/user'))
  assert.ok(isUserPortalPath('/pc/user/orders'))
  assert.ok(!isUserPortalPath('/pc'))
  assert.ok(!isUserPortalPath('/system/user'))
  assert.ok(!isUserPortalPath('/'))
  assert.ok(!isUserPortalPath(undefined))
})

test('safePortalRedirect falls back to home for empty/unsafe redirect', () => {
  assert.equal(safePortalRedirect(undefined, '00'), '/')
  assert.equal(safePortalRedirect(undefined, '01'), USER_PORTAL_HOME)
  assert.equal(safePortalRedirect('http://evil.com', '00'), '/')
  assert.equal(safePortalRedirect('//evil.com', '00'), '/')
  assert.equal(safePortalRedirect('system/user', '01'), USER_PORTAL_HOME)
})

test('safePortalRedirect never crosses account domain', () => {
  // 用户端账号不得被重定向到管理端路径
  assert.equal(safePortalRedirect('/system/user', '01'), USER_PORTAL_HOME)
  assert.equal(safePortalRedirect('/', '01'), USER_PORTAL_HOME)
  // 管理员不得被重定向到用户门户
  assert.equal(safePortalRedirect('/pc/user', '00'), '/')
  // 同域内的合法重定向保持不变
  assert.equal(safePortalRedirect('/pc/user/orders', '02'), '/pc/user/orders')
  assert.equal(safePortalRedirect('/system/user', '00'), '/system/user')
})
