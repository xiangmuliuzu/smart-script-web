import test from 'node:test'
import assert from 'node:assert/strict'
import { notificationPayload, notificationError, notificationSubmission, mergeReceiverOptions, unreadSources } from '../src/utils/notificationDraft.js'
const form = () => ({ type: 'SYSTEM', title: ' 公告提醒 ', content: ' 正文\n第二行 ', userIds: [12, 4, 12], businessType: '', businessId: '' })
test('equivalent retries preserve request ID despite whitespace and receiver order', () => {
  const first = notificationSubmission(notificationPayload(form()), null, () => 'request-1')
  const retry = notificationSubmission(notificationPayload({ ...form(), userIds: [4, 12], title: '公告提醒' }), first, () => 'request-2')
  assert.equal(retry.data.requestId, 'request-1')
  assert.deepEqual(retry.data.userIds, [4, 12])
})
test('changed content and receiver selection generate a new request ID', () => {
  const first = notificationSubmission(notificationPayload(form()), null, () => 'request-1')
  for (const changed of [{ ...form(), content: '新正文' }, { ...form(), userIds: [4, 13] }]) {
    assert.equal(notificationSubmission(notificationPayload(changed), first, () => 'request-2').data.requestId, 'request-2')
  }
})
test('message validation enforces receiver limit, whitespace and paired references', () => {
  assert.equal(notificationError(notificationPayload(form())), '')
  for (const changed of [{ ...form(), title: '  ' }, { ...form(), content: '字'.repeat(2001) }, { ...form(), userIds: Array.from({ length: 51 }, (_, i) => i + 1) }, { ...form(), userIds: [0] }, { ...form(), businessType: 'WORK' }]) {
    assert.ok(notificationError(notificationPayload(changed)))
  }
})
test('new receiver search retains selected options and replaces old search results', () => {
  const selected = { userId: 4, nickname: '已选择' }
  assert.deepEqual(mergeReceiverOptions([selected, { userId: 8 }], [{ userId: 12 }], [4]), [selected, { userId: 12 }])
})
test('unread aggregate includes announcements and rejects incomplete numeric totals', () => {
  const success = value => ({ status: 'fulfilled', value })
  assert.deepEqual(unreadSources([success(2), success(3), success(17)], [0, 0, 0]), { counts: [2, 3, 17], complete: true, total: 22 })
  const partial = unreadSources([success(2), success(3), { status: 'rejected' }], [1, 1, 17])
  assert.equal(partial.complete, false); assert.equal(partial.total, 22)
  assert.equal(unreadSources([success(2), success(3), success('17')], [1, 1, 17]).complete, false)
})
