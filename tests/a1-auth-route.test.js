import test from 'node:test'
import assert from 'node:assert/strict'
import {
  unwrapRuoYiResponse,
  extractUserAssociations,
  extractRoleMenuSelection,
  collectRolePayload,
  collectUserUpdatePayload,
  mapMenuTreeSelect,
  joinPath,
  isExternal,
  resolveFromMap,
  hasPermission,
  safeRedirectPath,
  adaptNodesForTest
} from '../src/utils/ruoyi-response.js'

const componentMap = {
  Layout: () => null,
  'dashboard/Dashboard': () => null,
  'system/user/index': () => null
}

test('unwrap keeps AjaxResult top-level extras when data is object', () => {
  const raw = {
    code: 200,
    msg: 'ok',
    data: { userId: 1, userName: 'admin', deptId: 103, roles: [{ roleId: 2 }] },
    postIds: [7, 8],
    roleIds: [2],
    roles: [{ roleId: 2, roleName: 'ops' }],
    posts: [{ postId: 7, postName: 'dev' }]
  }
  const out = unwrapRuoYiResponse(raw)
  assert.equal(out.userName, 'admin')
  assert.deepEqual(out.postIds, [7, 8])
  assert.deepEqual(out.roleIds, [2])
  assert.equal(out.roles[0].roleId, 2)
  assert.equal(out.posts[0].postId, 7)
})

test('unwrap does not let data null postIds/roleIds clobber top-level arrays', () => {
  // 复现若依 getUser：SysUser 实体字段为 null，关联数组在 AjaxResult 顶层
  const raw = {
    code: 200,
    msg: '查询成功',
    data: {
      userId: 9,
      userName: 'ops01',
      nickName: 'ops',
      deptId: 103,
      postIds: null,
      roleIds: null,
      roles: [{ roleId: 2, roleName: 'a1' }]
    },
    postIds: [7],
    roleIds: [2],
    roles: [{ roleId: 2, roleName: 'a1' }],
    posts: [{ postId: 7, postName: '编辑' }]
  }
  const out = unwrapRuoYiResponse(raw)
  assert.deepEqual(out.postIds, [7], 'top-level postIds must win over data.postIds null')
  assert.deepEqual(out.roleIds, [2], 'top-level roleIds must win over data.roleIds null')
  assert.equal(out.userName, 'ops01')
  const assoc = extractUserAssociations(out)
  assert.deepEqual(assoc.postIds, [7])
  assert.deepEqual(assoc.roleIds, [2])
})

test('unwrap returns array data as array (getRouters)', () => {
  const out = unwrapRuoYiResponse({ code: 200, msg: 'ok', data: [{ path: '/dashboard' }] })
  assert.ok(Array.isArray(out))
  assert.equal(out[0].path, '/dashboard')
})

test('unwrap returns full object when data is null (TableDataInfo / login token)', () => {
  const table = { code: 200, msg: 'ok', rows: [{ userId: 1 }], total: 1 }
  assert.deepEqual(unwrapRuoYiResponse(table).rows, [{ userId: 1 }])
  const login = { code: 200, msg: 'ok', token: 't1' }
  assert.equal(unwrapRuoYiResponse(login).token, 't1')
})

test('extractUserAssociations reads top-level postIds/roleIds', () => {
  const merged = unwrapRuoYiResponse({
    code: 200,
    data: { userId: 9, userName: 'u', deptId: 5 },
    postIds: [3],
    roleIds: [1, 2],
    roles: [{ roleId: 1 }, { roleId: 2 }],
    posts: [{ postId: 3 }]
  })
  const assoc = extractUserAssociations(merged)
  assert.deepEqual(assoc.postIds, [3])
  assert.deepEqual(assoc.roleIds, [1, 2])
  assert.equal(assoc.deptId, 5)
})

test('extractUserAssociations falls back to roles[].roleId when roleIds missing', () => {
  const assoc = extractUserAssociations({
    userId: 1,
    roles: [{ roleId: 4 }],
    postIds: [8]
  })
  assert.deepEqual(assoc.roleIds, [4])
  assert.deepEqual(assoc.postIds, [8])
})

test('extractRoleMenuSelection reads checkedKeys and menus from top-level', () => {
  const raw = unwrapRuoYiResponse({
    code: 200,
    msg: 'ok',
    checkedKeys: [5100, 5210],
    menus: [{ id: 1, label: 'root', children: [] }]
  })
  const sel = extractRoleMenuSelection(raw)
  assert.deepEqual(sel.checkedKeys, [5100, 5210])
  assert.equal(sel.menus.length, 1)
})

test('role payload always includes menuIds array (prevents NPE + preserve)', () => {
  const p1 = collectRolePayload({ roleName: 'r', roleKey: 'k' }, undefined)
  assert.deepEqual(p1.menuIds, [])
  const p2 = collectRolePayload({ roleId: 3, roleName: 'r', roleKey: 'k' }, [1, 5])
  assert.deepEqual(p2.menuIds, [1, 5])
})

test('user update payload falls back to associations when form empty', () => {
  const payload = collectUserUpdatePayload(
    { userId: 1, userName: 'a', roleIds: [], postIds: [], deptId: null, status: '0' },
    { roleIds: [2], postIds: [7], deptId: 103 }
  )
  assert.deepEqual(payload.roleIds, [2])
  assert.deepEqual(payload.postIds, [7])
  assert.equal(payload.deptId, 103)
})

test('user update payload honors hydrated form postIds including intentional empty', () => {
  const hydrated = collectUserUpdatePayload(
    { userId: 1, userName: 'a', roleIds: [2], postIds: [], deptId: 103, status: '0' },
    { roleIds: [2], postIds: [7], deptId: 103 },
    { formHydrated: true }
  )
  assert.deepEqual(hydrated.roleIds, [2])
  assert.deepEqual(hydrated.postIds, [])
})

test('mapMenuTreeSelect maps ruoyi tree nodes', () => {
  const tree = mapMenuTreeSelect([{ id: 1, label: 'a', children: [{ menuId: 2, menuName: 'b', children: [] }] }])
  assert.equal(tree[0].id, 1)
  assert.equal(tree[0].children[0].id, 2)
})

test('path/permission helpers', () => {
  assert.equal(joinPath('/system', 'user'), '/system/user')
  assert.equal(joinPath('/operation', '/user'), '/user')
  assert.equal(isExternal('https://x.com'), true)
  assert.equal(resolveFromMap(componentMap, 'nope'), null)
  assert.equal(hasPermission(['*:*:*'], 'system:user:add'), true)
  assert.equal(hasPermission(['system:user:list'], 'system:user:add'), false)
  assert.equal(safeRedirectPath('//evil'), '/dashboard')
})

test('dynamic route adapter rejects unknown components', () => {
  const { paths, rejected } = adaptNodesForTest([
    { path: '/dashboard', component: 'dashboard/Dashboard' },
    { path: '/x', component: 'not/Mapped' }
  ], componentMap)
  assert.deepEqual(paths, ['/dashboard'])
  assert.equal(rejected.some((r) => r.reason === 'unknown-component'), true)
})
