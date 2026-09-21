#!/usr/bin/env node
/**
 * Web 契约门禁：检查生产页面是否调用真实契约（非测试副本）。
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const checks = []

function check(name, fn) {
  try {
    fn()
    checks.push({ name, ok: true })
  } catch (e) {
    checks.push({ name, ok: false, err: e.message })
  }
}

check('request.js uses shared unwrapRuoYiResponse', () => {
  const src = readFileSync(join(webRoot, 'src/utils/request.js'), 'utf8')
  if (!src.includes("from '@/utils/ruoyi-response'")) throw new Error('request must import ruoyi-response')
  if (!src.includes('unwrapRuoYiResponse')) throw new Error('request must call unwrapRuoYiResponse')
})

check('role page calls roleMenuTreeselect (not only getRole)', () => {
  const src = readFileSync(join(webRoot, 'src/views/system/role/index.vue'), 'utf8')
  if (!src.includes('roleMenuTreeselect')) throw new Error('role page must call roleMenuTreeselect')
  if (!src.includes('collectRolePayload')) throw new Error('role page must use collectRolePayload')
  if (!src.includes('@/utils/ruoyi-response')) throw new Error('role page must import production helpers')
})

check('user page extracts postIds via production helper', () => {
  const src = readFileSync(join(webRoot, 'src/views/system/user/index.vue'), 'utf8')
  if (!src.includes('extractUserAssociations')) throw new Error('user page must use extractUserAssociations')
  if (!src.includes('collectUserUpdatePayload')) throw new Error('user page must use collectUserUpdatePayload')
  if (!src.includes('@/utils/ruoyi-response')) throw new Error('user page must import production helpers')
})

check('menu api exports roleMenuTreeselect', () => {
  const src = readFileSync(join(webRoot, 'src/api/system/menu.js'), 'utf8')
  if (!src.includes('roleMenuTreeselect')) throw new Error('missing roleMenuTreeselect export')
  if (!src.includes('/system/menu/roleMenuTreeselect/')) throw new Error('wrong roleMenuTreeselect path')
})

check('component-map declares whitelist keys', () => {
  const src = readFileSync(join(webRoot, 'src/router/component-map.js'), 'utf8')
  if (!src.includes('export const componentMap')) throw new Error('missing componentMap')
  for (const key of ['Layout', 'system/user/index', 'dashboard/Dashboard']) {
    const quoted = src.includes(`'${key}'`) || src.includes(`"${key}"`)
    const bare = new RegExp(`(^|[\\n\\s,{])${key}\\s*:`).test(src)
    if (!quoted && !bare) throw new Error(`missing map key ${key}`)
  }
})

check('login api ruoyi endpoints only', () => {
  const src = readFileSync(join(webRoot, 'src/api/login.js'), 'utf8')
  for (const p of ['/captchaImage', '/login', '/getInfo', '/logout']) {
    if (!src.includes(`url: '${p}'`) && !src.includes(`url: "${p}"`)) throw new Error(`missing ${p}`)
  }
  if (/url:\s*['"]\/api\/v1\/admin/.test(src)) throw new Error('login api must not use product prefix')
})

check('menu page defines openForm', () => {
  const src = readFileSync(join(webRoot, 'src/views/system/menu/index.vue'), 'utf8')
  if (!src.includes('function openForm') && !src.includes('openForm =')) throw new Error('menu openForm missing')
})

check('seed sql absolute user/risk paths and safe grants', async () => {
  const sql = readFileSync(join(webRoot, '../shared/sql/a1-p5-menu-seed.sql'), 'utf8')
  // P0: /user /risk 以根级 path（user/risk）或绝对 path '/user' 表达，RuoYi 生成 /user
  const hasUser = sql.includes("'/user'") || /parent_id,0|parent_id, 0|,0,'user'|SELECT 5142[^\n]*user'\/UserManage|,'user','user\/UserManage'/.test(sql) || sql.includes(",'user','user/UserManage'")
  const hasRisk = sql.includes("'/risk'") || sql.includes(",'risk','risk/RiskManage'")
  if (!hasUser && !sql.includes("user/UserManage")) throw new Error("seed must map product page user/UserManage at root path user")
  if (!hasRisk && !sql.includes("risk/RiskManage")) throw new Error("seed must map product page risk/RiskManage")
  // 根级 user 路径
  if (!sql.includes("user/UserManage")) throw new Error('seed missing user/UserManage component mapping')
  if (!sql.includes('WHERE t.parent_id IS NOT NULL')) {
    throw new Error('children must skip when resolved parent is NULL')
  }
  // R1: system/monitor 根目录必须检查 path 已存在，防止标准库插入第二套
  if (!sql.includes("path='system' AND parent_id=0") || !sql.includes('@p_system IS NULL')) {
    throw new Error('seed must skip system root when path already exists')
  }
  if (!sql.includes("path='monitor' AND parent_id=0") || !sql.includes('@p_monitor IS NULL')) {
    throw new Error('seed must skip monitor root when path already exists')
  }
  // R3: 不得 UPDATE 已有角色 remark
  if (/UPDATE\s+sys_role\s+SET\s+remark/i.test(sql.replace(/--[^\n]*/g, ''))) {
    throw new Error('seed must not UPDATE existing sys_role.remark')
  }
  if (!sql.includes("A1SEED-CREATED")) throw new Error('created role must use A1SEED-CREATED marker')
  // R4: 自动授权必须限定 remark A1SEED
  const autoGrant = sql.split(/自动授权|R4/)[1] || ''
  if (!/m\.remark LIKE 'A1SEED%'/i.test(sql)) {
    throw new Error('auto grants must be limited to A1SEED menus')
  }
  // 回滚文件：只删 A1SEED 关联 + A1SEED-CREATED 角色
  const rollback = readFileSync(join(webRoot, '../shared/sql/a1-p5-menu-rollback.sql'), 'utf8')
  if (!rollback.includes("m.remark LIKE 'A1SEED%'")) throw new Error('rollback must join A1SEED menus only')
  if (!rollback.includes("remark='A1SEED-CREATED'")) throw new Error('rollback must only delete A1SEED-CREATED roles')
  if (/DELETE FROM sys_menu WHERE menu_id BETWEEN/i.test(rollback.replace(/--[^\n]*/g, ''))) {
    throw new Error('rollback must not delete by ID range')
  }
})

check('unwrap prefers top-level non-null over data null', () => {
  const src = readFileSync(join(webRoot, 'src/utils/ruoyi-response.js'), 'utf8')
  if (src.includes('{ ...rest, ...data }')) {
    throw new Error('data null must not clobber top-level postIds; use data first + topDefined')
  }
  if (!src.includes('topDefined') && !src.includes('value !== undefined && value !== null')) {
    throw new Error('unwrap must filter null top-level overwrite from data')
  }
})

const failed = checks.filter((c) => !c.ok)
for (const c of checks) {
  if (c.ok) console.log(`[typecheck-static] PASS ${c.name}`)
  else console.error(`[typecheck-static] FAIL ${c.name}: ${c.err}`)
}

import(pathToFileURL(join(webRoot, 'src/utils/ruoyi-response.js')).href)
  .then((mod) => {
    if (typeof mod.unwrapRuoYiResponse !== 'function') throw new Error('unwrap missing')
    console.log('[typecheck-static] PASS production ruoyi-response importable')
    if (failed.length) process.exit(1)
  })
  .catch((e) => {
    console.error('[typecheck-static] FAIL production import:', e.message)
    process.exit(1)
  })
