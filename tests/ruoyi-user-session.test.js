import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import { createPinia, defineStore, setActivePinia } from 'pinia'

const source = await readFile(new URL('../src/stores/pcUser.js', import.meta.url), 'utf8')
const script = source.replace(/^import[\s\S]*?from ['"][^'"]+['"]\r?$/gm, '')
  .replace('export const usePcUserStore', 'const usePcUserStore')
  .replace('export default usePcUserStore', '')

function session() {
  setActivePinia(createPinia())
  const writes = []
  const context = {
    defineStore, getUserToken: () => '', getMe: async () => ({ userId: 8, authorCapability: true }),
    appLogout: async () => {}, setUserToken: token => writes.push(['token', token]),
    removeUserToken: () => writes.push(['clear-token']),
    removeUserRefreshToken: () => writes.push(['clear-legacy-refresh']),
    setAccountType: type => writes.push(['type', type]),
    removeAccountType: () => writes.push(['clear-type']),
    usePcUnreadStore: () => ({ reset: () => writes.push(['reset-unread']) })
  }
  runInNewContext(`${script}\nthis.store = usePcUserStore()`, context)
  return { store: context.store, writes }
}

test('PC user accepts the top-level RuoYi token and removes legacy refresh token', async () => {
  const { store, writes } = session()
  store.setSession({ code: 200, token: 'app-domain-token', user: { userId: 8 } }, '01')
  assert.equal(store.token, 'app-domain-token')
  assert.equal(store.user.userId, 8)
  assert.deepEqual(writes, [['token', 'app-domain-token'], ['clear-legacy-refresh'], ['type', '01']])
  await store.fetchMe()
  assert.equal(store.authorCapability, true)
  await store.logout()
  assert.equal(store.token, '')
  assert.equal(store.user, null)
  assert.ok(writes.some(row => row[0] === 'reset-unread'))
})

test('unified PC login passes the same response into the user store', async () => {
  const login = await readFile(new URL('../src/views/user/Login.vue', import.meta.url), 'utf8')
  assert.match(login, /pcUserStore\.setSession\(result, accountType\)/)
  assert.doesNotMatch(source, /session\?\.accessToken/)
})
