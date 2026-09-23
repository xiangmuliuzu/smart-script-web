import { resolveComponent } from '@/router/component-map'

const DIAG = '[route-adapter]'

function isExternal(path) {
  return typeof path === 'string' && /^(https?:|mailto:|tel:)/i.test(path)
}

function joinPath(parentPath, childPath) {
  if (!childPath) return parentPath || '/'
  if (childPath.startsWith('/')) return childPath
  const base = !parentPath || parentPath === '/' ? '' : parentPath.replace(/\/$/, '')
  return `${base}/${childPath}`.replace(/\/{2,}/g, '/')
}

/**
 * 将若依 RouterVo 转为 Vue Router：所有已映射叶子页注册到 MainLayout 下的绝对路径。
 * 未知 component 默认拒绝。
 */
export function adaptRuoYiRoutes(routers) {
  const rejected = []
  const leaves = []
  const sidebar = []

  if (!Array.isArray(routers)) {
    console.warn(DIAG, 'getRouters payload is not an array')
    return { routes: [], rejected, sidebar: [] }
  }

  function walk(items, parentPath) {
    const localSidebar = []
    for (const item of items || []) {
      if (!item || typeof item !== 'object') continue
      if (isExternal(item.path) || isExternal(item.meta?.link)) continue

      const path = joinPath(parentPath, item.path || '')
      const componentId = item.component
      const childrenVo = Array.isArray(item.children) ? item.children : []
      const meta = {
        title: item.meta?.title || item.name || path,
        icon: item.meta?.icon || '',
        noCache: !!item.meta?.noCache,
        hidden: !!item.hidden
      }
      const isDir =
        componentId === 'Layout' ||
        componentId === 'ParentView' ||
        (!componentId && childrenVo.length > 0)

      if (isDir) {
        const childSidebar = walk(childrenVo, path)
        // 目录自身没有路由：子项全被白名单拒绝时它只会渲染成一个点不动的空壳，
        // 因此只在有可见子项时才进侧边栏（与 utils/ruoyi-response.js 的 empty-directory 判定一致）。
        if (childSidebar.length) {
          localSidebar.push({
            path,
            name: item.name || `Dir_${path.replace(/\W+/g, '_')}`,
            meta,
            hidden: !!item.hidden,
            children: childSidebar
          })
        }
        continue
      }

      const comp = resolveComponent(componentId)
      if (!comp) {
        rejected.push({ path, component: String(componentId || ''), reason: 'unknown-component' })
        console.warn(DIAG, 'deny unknown component', { path, component: componentId })
        continue
      }

      const leaf = {
        path,
        // name 必须全局唯一：避免 product /user 与 system /system/user 都叫 User
        name: (item.name ? `${item.name}` : String(componentId).replace(/[^\w]+/g, '_')) +
          '__' + path.replace(/[^\w]+/g, '_'),
        component: comp,
        meta,
        hidden: !!item.hidden
      }
      leaves.push(leaf)
      if (!item.hidden) {
        localSidebar.push({
          path,
          name: leaf.name,
          meta,
          hidden: false,
          children: []
        })
      }
    }
    return localSidebar
  }

  const topSidebar = walk(routers, '')
  sidebar.push(...topSidebar)

  const layoutComp = resolveComponent('Layout')
  const visibleLeaves = leaves.filter((l) => !l.meta?.hidden)
  const preferred =
    visibleLeaves.find((l) => l.path === '/dashboard') ||
    visibleLeaves.find((l) => l.path === '/user') ||
    visibleLeaves[0] ||
    leaves[0]

  const routes = []
  if (layoutComp && leaves.length) {
    routes.push({
      path: '/',
      name: 'MainShell',
      component: layoutComp,
      redirect: preferred?.path || '/404',
      meta: { title: '首页', hidden: true },
      children: leaves
    })
  }

  return { routes, rejected, sidebar }
}

export default adaptRuoYiRoutes
