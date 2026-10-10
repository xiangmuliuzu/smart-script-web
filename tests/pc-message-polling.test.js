import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import { parse } from '@vue/compiler-sfc'
import { computed, nextTick, ref } from 'vue'

// Execute the actual SFC setup with API/lifecycle stubs; keep Vue reactivity real.
const source = await readFile(new URL('../src/views/pc/UserMessages.vue', import.meta.url), 'utf8')
const { descriptor } = parse(source)
const setupCode = descriptor.scriptSetup.content.replace(/^import[\s\S]*?from ['"][^'"]+['"]\r?$/gm, '')
const session = id => ({ sessionId: id, peerName: `管理员${id}`, status: 1, unread: 0 })
const message = id => ({ messageId: id, content: `消息${id}` })

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

function setup(overrides = {}) {
  let mounted, unmounted
  const intervals = new Set()
  const listeners = new Map()
  const wrap = { scrollTop: 700, scrollHeight: 1000, clientHeight: 300 }
  const context = {
    ref, computed, nextTick,
    useRouter: () => ({}), usePcUserStore: () => ({ user: { userId: 1 } }),
    usePcUnreadStore: () => ({ refresh: async () => {} }),
    onMounted: callback => { mounted = callback },
    onUnmounted: callback => { unmounted = callback },
    setInterval: callback => { intervals.add(callback); return callback },
    clearInterval: callback => intervals.delete(callback),
    document: {
      hidden: false,
      addEventListener: (event, callback) => listeners.set(event, callback),
      removeEventListener: event => listeners.delete(event)
    },
    listChatSessions: async () => ({ list: [session(1)] }),
    listChatMessages: async () => ({ list: [message(1)] }),
    listMessages: async () => ({ list: [], total: 0 }),
    ...overrides
  }
  runInNewContext(`${setupCode}\nthis.page = {
    sessions, sessionsLoading, activeSession, chatMessages, messagesLoading, convScrollRef,
    loadSessions, loadChatMessages, openSession, poll
  }`, context)
  context.page.convScrollRef.value = { wrapRef: wrap }
  return { page: context.page, wrap, context, intervals, listeners, mount: () => mounted(), unmount: () => unmounted() }
}

test('polling stays silent, keeps unchanged data and does not jump through chat history', async () => {
  const requests = []
  const h = setup({
    listChatSessions: async (params, options) => { requests.push(options); return { list: [session(1)] } },
    listChatMessages: async (id, options) => { requests.push(options); return { list: [message(1)] } }
  })
  await h.page.loadSessions()
  await h.page.openSession(h.page.sessions.value[0])
  const previous = h.page.chatMessages.value
  h.wrap.scrollTop = 100
  await h.page.poll()
  assert.equal(h.page.sessionsLoading.value, false)
  assert.equal(h.page.messagesLoading.value, false)
  assert.equal(h.page.chatMessages.value, previous)
  assert.equal(h.wrap.scrollTop, 100)
  assert.deepEqual(requests.map(options => options.silent), [false, false, true, true])
})

test('new messages preserve history position and follow only when already at the bottom', async () => {
  let list = [message(1)]
  const h = setup({ listChatMessages: async () => ({ list }) })
  await h.page.openSession(session(1))
  h.wrap.scrollTop = 100
  list = [message(1), message(2)]
  await h.page.poll()
  assert.equal(h.page.chatMessages.value.length, 2)
  assert.equal(h.wrap.scrollTop, 100)
  h.wrap.scrollTop = 700
  list = [...list, message(3)]
  await h.page.poll()
  assert.equal(h.page.chatMessages.value.length, 3)
  assert.equal(h.wrap.scrollTop, h.wrap.scrollHeight)
})

test('slow polling does not overlap or display loading masks; failures retain existing data', async () => {
  const pending = deferred()
  let calls = 0
  const h = setup({ listChatMessages: () => { calls++; return pending.promise } })
  h.page.sessions.value = [session(1)]
  h.page.activeSession.value = session(1)
  h.page.chatMessages.value = [message(1)]
  const polling = h.page.poll()
  await h.page.poll()
  assert.equal(calls, 1)
  assert.equal(h.page.messagesLoading.value, false)
  pending.reject(new Error('network unavailable'))
  await polling
  assert.equal(h.page.chatMessages.value[0].messageId, 1)
  h.context.listChatSessions = async () => { throw new Error('network unavailable') }
  await h.page.poll()
  assert.equal(h.page.sessions.value[0].sessionId, 1)
})

test('a response for the previous conversation cannot overwrite the newly selected conversation', async () => {
  const pending = deferred()
  const h = setup({ listChatMessages: id => id === 1 ? pending.promise : Promise.resolve({ list: [message(2)] }) })
  h.page.activeSession.value = session(1)
  const polling = h.page.poll()
  await h.page.openSession(session(2))
  h.wrap.scrollTop = 100
  pending.resolve({ list: [message(1)] })
  await polling
  assert.equal(h.page.activeSession.value.sessionId, 2)
  assert.equal(h.page.chatMessages.value[0].messageId, 2)
  assert.equal(h.wrap.scrollTop, 100)
})

test('foreground loading supersedes an older poll and is not interrupted by another poll', async () => {
  const background = deferred()
  const foreground = deferred()
  let calls = 0
  const h = setup({ listChatMessages: () => ++calls === 1 ? background.promise : foreground.promise })
  h.page.activeSession.value = session(1)
  const polling = h.page.poll()
  const opening = h.page.openSession(session(1))
  background.resolve({ list: [message(1)] })
  await polling
  assert.equal(h.page.messagesLoading.value, true)
  await h.page.poll()
  assert.equal(calls, 2)
  foreground.resolve({ list: [message(2)] })
  await opening
  assert.equal(h.page.messagesLoading.value, false)
  assert.equal(h.page.chatMessages.value[0].messageId, 2)
})

test('leaving during initial loading cannot create a polling timer or accept the response', async () => {
  const pending = deferred()
  const h = setup({ listChatSessions: () => pending.promise })
  const mounting = h.mount()
  h.unmount()
  pending.resolve({ list: [session(1)] })
  await mounting
  assert.equal(h.intervals.size, 0)
  assert.equal(h.listeners.size, 0)
  assert.equal(h.page.sessions.value.length, 0)
})

test('hidden pages pause polling and leaving removes timers and in-flight updates', async () => {
  const pending = deferred()
  let calls = 0
  const h = setup({ listChatMessages: () => { calls++; return pending.promise } })
  await h.mount()
  assert.equal(h.intervals.size, 1)
  h.page.activeSession.value = session(1)
  h.context.document.hidden = true
  await h.page.poll()
  assert.equal(calls, 0)
  h.context.document.hidden = false
  const polling = h.page.poll()
  h.unmount()
  pending.resolve({ list: [message(1)] })
  await polling
  assert.equal(h.intervals.size, 0)
  assert.equal(h.listeners.size, 0)
  assert.equal(h.page.chatMessages.value.length, 0)
})
