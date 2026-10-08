#!/usr/bin/env node
/**
 * Web 静态门禁：禁止 Mock 认证/错误认证路径/角色名绕过。
 * 不引入新 npm 依赖；返回非 0 表示门禁失败。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../src/', import.meta.url))
const banned = [
  { re: /admin_token/, msg: 'legacy token key admin_token' },
  { re: /VITE_USE_MOCK\s*===\s*['"]true['"]/, msg: 'production mock login branch' },
  { re: /mock_token_/, msg: 'mock token mint' },
  { re: /['"]\/user\/login['"]/, msg: 'wrong auth path /user/login' },
  { re: /isSuperAdmin|super_admin/, msg: 'role-name permission bypass' }
]

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, files)
    else if (/\.(vue|js|mjs|ts)$/.test(name)) files.push(p)
  }
  return files
}

let failed = 0
for (const file of walk(root)) {
  const text = readFileSync(file, 'utf8')
  for (const rule of banned) {
    if (rule.re.test(text)) {
      console.error(`[lint-static] FAIL ${file}: ${rule.msg}`)
      failed += 1
    }
  }
  if (!text.includes('node_modules')) {
    // 模板/注释中的示例密码不在 src 扫描目标内
  }
}

if (failed > 0) {
  console.error(`[lint-static] ${failed} violation(s)`)
  process.exit(1)
}
console.log('[lint-static] pass: no banned auth/permission patterns in src')
