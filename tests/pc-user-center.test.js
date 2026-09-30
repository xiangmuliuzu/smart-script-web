import test from 'node:test'
import assert from 'node:assert/strict'
import {
  userTypeLabel,
  realNameStatusLabel,
  realNameTagType,
  accountStatusLabel,
  formatRegisteredTime,
  passwordPolicyError,
  unreadBadgeText
} from '../src/utils/pcFormat.js'

// ---------------- 文案映射 ----------------

test('userTypeLabel maps known codes and falls back to 用户', () => {
  assert.equal(userTypeLabel('01'), '普通用户')
  assert.equal(userTypeLabel('02'), '创作者')
  assert.equal(userTypeLabel('03'), '甲方')
  assert.equal(userTypeLabel(undefined), '用户')
  assert.equal(userTypeLabel('99'), '用户')
})

test('realNameStatusLabel shows 状态未知 for unknown values, never fake APPROVED', () => {
  assert.equal(realNameStatusLabel('NOT_SUBMITTED'), '未认证')
  assert.equal(realNameStatusLabel('PENDING'), '审核中')
  assert.equal(realNameStatusLabel('APPROVED'), '已认证')
  assert.equal(realNameStatusLabel('REJECTED'), '未通过')
  assert.equal(realNameStatusLabel('WHATEVER'), '状态未知')
  assert.equal(realNameStatusLabel(undefined), '状态未知')
  assert.equal(realNameTagType('APPROVED'), 'success')
  assert.equal(realNameTagType('PENDING'), 'warning')
  assert.equal(realNameTagType('REJECTED'), 'danger')
  assert.equal(realNameTagType('NOT_SUBMITTED'), 'info')
  assert.equal(realNameTagType('X'), 'info')
})

test('accountStatusLabel never falls back to 正常 for unknown codes', () => {
  assert.equal(accountStatusLabel('0'), '正常')
  assert.equal(accountStatusLabel('1'), '停用')
  assert.equal(accountStatusLabel('9'), '状态未知')
  assert.equal(accountStatusLabel(null), '状态未知')
  assert.equal(accountStatusLabel(''), '状态未知')
})

// ---------------- 注册时间（Asia/Hong_Kong，YYYY-MM-DD HH:mm:ss） ----------------

test('formatRegisteredTime converts ISO offset time to Hong Kong clock', () => {
  // +08:00 与 Asia/Hong_Kong 同偏移，不应发生换算
  assert.equal(formatRegisteredTime('2026-09-30T10:00:00+08:00'), '2026-09-30 10:00:00')
  // UTC 输入换算到 +08:00
  assert.equal(formatRegisteredTime('2026-09-30T02:30:05Z'), '2026-09-30 10:30:05')
  // 跨日边界：UTC 16:00 → 香港 24:00 次日
  assert.equal(formatRegisteredTime('2026-01-01T16:00:00Z'), '2026-01-02 00:00:00')
})

test('formatRegisteredTime renders — for missing or invalid values', () => {
  assert.equal(formatRegisteredTime(null), '—')
  assert.equal(formatRegisteredTime(undefined), '—')
  assert.equal(formatRegisteredTime(''), '—')
  assert.equal(formatRegisteredTime('not-a-date'), '—')
  assert.equal(formatRegisteredTime('2026-13-40T99:00:00+08:00'), '—')
})

// ---------------- 密码策略（与后端 validatePasswordPolicy 同口径） ----------------

test('passwordPolicyError enforces 8-64 chars with letter and digit', () => {
  assert.equal(passwordPolicyError('abcd1234'), null)
  assert.equal(passwordPolicyError('a'.repeat(63) + '1'), null)
  // 7 / 65 个字符
  assert.ok(passwordPolicyError('abcd123'))
  assert.ok(passwordPolicyError('a'.repeat(64) + '1'))
  // 纯字母 / 纯数字
  assert.ok(passwordPolicyError('abcdefgh'))
  assert.ok(passwordPolicyError('12345678'))
  // 缺失值
  assert.ok(passwordPolicyError(undefined))
})

test('passwordPolicyError uses Unicode letter/digit classes matching the backend', () => {
  // F07 复现输入：汉字 + 数字，后端（Character.isLetter/isDigit）接受，前端必须同样放行
  assert.equal(passwordPolicyError('汉字密码测试甲1'), null)
  // 汉字算字母、全角数字算数字（两端 Nd 口径一致）
  assert.equal(passwordPolicyError('汉字密码甲乙丙１'), null)
  // 纯汉字（无数字）仍拒绝
  assert.ok(passwordPolicyError('汉字密码甲乙丙丁'))
  // 全角数字不算字母
  assert.ok(passwordPolicyError('１２３４５６７８'))
  // emoji 既非字母也非数字：仅有 emoji 和数字时仍拒绝
  assert.ok(passwordPolicyError('🔥🔥🔥🔥1'))
  assert.ok(passwordPolicyError('🔥🔥🔥🔥'))
  // 长度按 UTF-16 代码单元计，与后端 String.length 一致：64 单元通过，65 单元拒绝
  assert.equal(passwordPolicyError('a'.repeat(63) + '1'), null)
  assert.ok(passwordPolicyError('a'.repeat(64) + '1'))
})

test('passwordPolicyError enforces the 72 UTF-8 byte limit shared with the backend', () => {
  // F08 复现值：38 单元 / 72 字节，字符规则与字节规则均合法
  assert.equal(passwordPolicyError('𠮷'.repeat(17) + 'ab12'), null)
  // 39 单元 / 73 字节：字符规则合法但超过 BCrypt 输入上限，前端先行拒绝
  assert.ok(passwordPolicyError('𠮷'.repeat(17) + 'abc12'))
  // 64 单元的全补充平面密码 = 126 字节，按字节上限拒绝
  assert.ok(passwordPolicyError('𠮷'.repeat(31) + 'a1'))
  // 64 个 ASCII 字符 = 64 字节，不受影响
  assert.equal(passwordPolicyError('a'.repeat(63) + '1'), null)
})

// ---------------- 未读角标 ----------------

test('unreadBadgeText shows nothing at 0, count to 99, caps at 99+', () => {
  assert.equal(unreadBadgeText(0), '')
  assert.equal(unreadBadgeText(1), '1')
  assert.equal(unreadBadgeText(99), '99')
  assert.equal(unreadBadgeText(100), '99+')
})

test('unreadBadgeText treats invalid values as failure (null), never wrong numbers', () => {
  assert.equal(unreadBadgeText(-1), null)
  assert.equal(unreadBadgeText(1.5), null)
  assert.equal(unreadBadgeText(NaN), null)
  assert.equal(unreadBadgeText('3'), null)
  assert.equal(unreadBadgeText(null), null)
  assert.equal(unreadBadgeText(undefined), null)
})
