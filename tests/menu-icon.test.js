import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { MENU_ICONS, MENU_ICON_ALIASES, resolveMenuIcon, resolveMenuIconName } from '../src/utils/menu-icon.js'

test('resolves Element Plus icon names as-is', () => {
  assert.equal(resolveMenuIconName('DataLine'), 'DataLine')
  assert.equal(resolveMenuIconName('Document'), 'Document')
  assert.equal(resolveMenuIcon('Stamp'), MENU_ICONS.Stamp)
})

test('resolves ruoyi legacy lowercase icon names', () => {
  const cases = {
    system: 'Setting',
    monitor: 'Monitor',
    peoples: 'UserFilled',
    'tree-table': 'Grid',
    post: 'Postcard',
    dict: 'Notebook',
    edit: 'EditPen',
    form: 'Document',
    logininfor: 'Key'
  }
  for (const [icon, expected] of Object.entries(cases)) {
    assert.equal(resolveMenuIconName(icon), expected, `${icon} -> ${expected}`)
  }
})

test('resolves product seed icons that Element Plus does not ship', () => {
  // 种子写了 Chart/Magic/Chat/dashboard，@element-plus/icons-vue 里没有同名组件
  const cases = { Chart: 'TrendCharts', Magic: 'MagicStick', Chat: 'ChatLineSquare', dashboard: 'Odometer' }
  for (const [icon, expected] of Object.entries(cases)) {
    assert.equal(resolveMenuIconName(icon), expected, `${icon} -> ${expected}`)
  }
})

test('menu tree picks icons up from meta.icon', () => {
  const tree = [
    { path: '/dashboard', meta: { title: '数据总览', icon: 'DataLine' } },
    { path: '/risk', meta: { title: '全局风控管理', icon: 'Warning' } },
    { path: '/unknown', meta: { title: '没有图标', icon: 'no-such-icon' } },
    { path: '/noicon', meta: { title: '未配置图标' } }
  ]
  assert.equal(resolveMenuIcon(tree[0].meta.icon), MENU_ICONS.DataLine)
  assert.equal(resolveMenuIcon(tree[1].meta.icon), MENU_ICONS.Warning)
  assert.equal(resolveMenuIcon(tree[2].meta.icon), null, '未登记的图标名必须降级为无图标')
  assert.equal(resolveMenuIcon(tree[3].meta.icon), null)
})

test('unresolvable input degrades to empty instead of throwing', () => {
  assert.equal(resolveMenuIconName(''), '')
  assert.equal(resolveMenuIconName('   '), '')
  assert.equal(resolveMenuIconName(undefined), '')
  assert.equal(resolveMenuIconName(null), '')
  assert.equal(resolveMenuIconName(42), '')
  assert.equal(resolveMenuIconName('NoSuchIcon'), '')
  assert.equal(resolveMenuIcon('NoSuchIcon'), null)
})

test('every alias points at a registered icon', () => {
  for (const [alias, target] of Object.entries(MENU_ICON_ALIASES)) {
    assert.ok(MENU_ICONS[target], `alias ${alias} -> ${target} 未登记`)
    assert.equal(alias, alias.toLowerCase(), `别名 ${alias} 必须小写`)
  }
})

/**
 * 从 A1 菜单种子里取出 icon 列的值。
 * 种子有三种行写法：显式 `'X' AS icon`、分组目录 `,'X','A1','A1SEED'`、
 * 叶子 `,'X','A1SEED'`（若依原生叶子行则把图标放在行尾）。数据行以数字 menu_id 开头，
 * 其余 `SELECT t.menu_id ...` 投影行与角色 INSERT 行都跳过。
 */
function seedIcons(sql) {
  const icons = new Set()
  for (const raw of sql.split(/\r?\n/)) {
    const row = raw.trim()
    if (!/^(UNION ALL )?SELECT \d+/.test(row)) continue
    const m =
      row.match(/'([A-Za-z0-9_-]+)'\s+AS\s+icon/i) ||
      row.match(/'([A-Za-z0-9_-]+)'\s*,\s*'A1'\s*,\s*'A1SEED'/) ||
      row.match(/'([A-Za-z0-9_-]+)'\s*,\s*'A1SEED'/) ||
      (/A1SEED/.test(row) ? null : row.match(/'([A-Za-z0-9_-]+)'\s*;?\s*$/))
    if (m) icons.add(m[1])
  }
  return icons
}

test('every icon configured in the menu seed resolves', () => {
  const sql = readFileSync(new URL('../../shared/sql/a1-p5-menu-seed.sql', import.meta.url), 'utf8')
  const icons = seedIcons(sql)
  assert.ok(icons.size >= 25, `种子图标解析异常，只取到 ${icons.size} 个`)
  const unresolved = [...icons].filter((icon) => !resolveMenuIconName(icon))
  assert.deepEqual(unresolved, [], `种子图标未登记: ${unresolved.join(', ')}`)
})
