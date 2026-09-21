/**
 * 若依 AjaxResult / TableDataInfo 解包。
 * 规则与 utils/request.js 响应拦截器一致，供页面与 node:test 共用。
 */
export function unwrapRuoYiResponse(res) {
  if (res === null || res === undefined) return res
  if (typeof res !== 'object') return res
  if (res instanceof Blob || res instanceof ArrayBuffer) return res

  const hasCode = Object.prototype.hasOwnProperty.call(res, 'code')
  const code = res.code
  if (hasCode && code !== undefined && code !== 200 && code !== 0) {
    // 调用方应在拦截器已处理错误；此处仅透传
    return res
  }

  const data = res.data
  if (data === undefined || data === null) {
    // TableDataInfo / AjaxResult 顶层字段（token、roles、permissions、postIds、checkedKeys…）
    return res
  }
  if (Array.isArray(data)) return data
  if (typeof data === 'object') {
    // 合并规则：data 为实体；AjaxResult 顶层非空业务字段（postIds/roleIds/checkedKeys…）优先，
    // 禁止 data 中的 null/undefined 覆盖顶层真实数组（否则编辑用户会清空岗位）。
    const { code: _c, msg: _m, data: _d, ...rest } = res
    const topDefined = {}
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined && value !== null) {
        topDefined[key] = value
      }
    }
    return { ...data, ...topDefined }
  }
  return data
}

/** 从 getUser 响应提取关联，避免后端先删后建清空 */
export function extractUserAssociations(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const user = source.user && typeof source.user === 'object' ? source.user : source
  const roleIds = Array.isArray(source.roleIds)
    ? source.roleIds.filter((id) => id !== null && id !== undefined)
    : Array.isArray(user.roleIds)
      ? user.roleIds.filter((id) => id !== null && id !== undefined)
      : Array.isArray(source.roles)
        ? source.roles.map((r) => r?.roleId).filter((id) => id !== null && id !== undefined)
        : Array.isArray(user.roles)
          ? user.roles.map((r) => r?.roleId).filter((id) => id !== null && id !== undefined)
          : []
  const postIds = Array.isArray(source.postIds)
    ? source.postIds.filter((id) => id !== null && id !== undefined)
    : Array.isArray(user.postIds)
      ? user.postIds.filter((id) => id !== null && id !== undefined)
      : []
  const deptId = source.deptId ?? user.deptId ?? null
  return {
    user,
    roleIds: [...roleIds],
    postIds: [...postIds],
    deptId,
    roleOptions: Array.isArray(source.roles) ? source.roles : [],
    postOptions: Array.isArray(source.posts) ? source.posts : []
  }
}

/** 从 roleMenuTreeselect 响应提取菜单树与勾选 */
export function extractRoleMenuSelection(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const checkedKeys = Array.isArray(source.checkedKeys)
    ? source.checkedKeys.filter((id) => id !== null && id !== undefined)
    : Array.isArray(source.data?.checkedKeys)
      ? source.data.checkedKeys
      : []
  const menus = Array.isArray(source.menus)
    ? source.menus
    : Array.isArray(source.data?.menus)
      ? source.data.menus
      : Array.isArray(source)
        ? source
        : []
  return { checkedKeys: [...checkedKeys], menus }
}

export function collectRolePayload(form, menuIds) {
  return {
    roleId: form.roleId ?? null,
    roleName: form.roleName,
    roleKey: form.roleKey,
    roleSort: form.roleSort ?? 0,
    status: form.status ?? '0',
    menuIds: Array.isArray(menuIds) ? [...menuIds] : []
  }
}

/**
 * 组装用户写操作 payload。
 * - formHydrated=false：表单空数组视为未加载，回退 associations，避免误清空
 * - formHydrated=true：以表单为准（页面已从 getUser 回填）；角色空数组仍回退 associations
 */
export function collectUserUpdatePayload(form, associations = {}, options = {}) {
  const formHydrated = !!options.formHydrated
  const formRoleIds = Array.isArray(form.roleIds)
    ? form.roleIds.filter((id) => id !== null && id !== undefined)
    : []
  const assocRoleIds = Array.isArray(associations.roleIds) ? associations.roleIds : []
  const roleIds = formRoleIds.length > 0 ? formRoleIds : assocRoleIds

  const formPostIds = Array.isArray(form.postIds)
    ? form.postIds.filter((id) => id !== null && id !== undefined)
    : null
  const assocPostIds = Array.isArray(associations.postIds) ? associations.postIds : []
  let postIds
  if (formPostIds === null) {
    postIds = assocPostIds
  } else if (formPostIds.length > 0) {
    postIds = formPostIds
  } else if (formHydrated) {
    // 已回填后的空数组 = 业务上清空岗位
    postIds = []
  } else {
    postIds = assocPostIds
  }

  return {
    userId: form.userId,
    userName: form.userName,
    nickName: form.nickName ?? '',
    phonenumber: form.phonenumber ?? '',
    status: form.status ?? '0',
    deptId: form.deptId ?? associations.deptId ?? null,
    roleIds: [...roleIds],
    postIds: [...postIds]
  }
}

export function mapMenuTreeSelect(list) {
  return (list || []).map((node) => ({
    id: node.id ?? node.menuId,
    label: node.label ?? node.menuName,
    children: mapMenuTreeSelect(node.children)
  }))
}

export function joinPath(parentPath, childPath) {
  if (!childPath) return parentPath || '/'
  if (childPath.startsWith('/')) return childPath
  const base = !parentPath || parentPath === '/' ? '' : parentPath.replace(/\/$/, '')
  return `${base}/${childPath}`.replace(/\/{2,}/g, '/')
}

export function isExternal(path) {
  return typeof path === 'string' && /^(https?:|mailto:|tel:)/i.test(path)
}

export function resolveFromMap(map, component) {
  if (!component || typeof component !== 'string') return null
  return Object.prototype.hasOwnProperty.call(map, component) ? map[component] : null
}

export function hasPermission(permissions, permission) {
  if (!permission) return true
  const list = Array.isArray(permissions) ? permissions : []
  return list.includes('*:*:*') || list.includes(permission)
}

export function safeRedirectPath(raw) {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/dashboard'
  }
  return raw
}

export function adaptNodesForTest(routers, componentMap) {
  const rejected = []
  const paths = []
  const walk = (items, parent) => {
    for (const item of items || []) {
      if (!item || typeof item !== 'object') continue
      if (isExternal(item.path)) continue
      const path = joinPath(parent, item.path || '')
      const children = Array.isArray(item.children) ? item.children : []
      const isDir = item.component === 'Layout' || item.component === 'ParentView' || (!item.component && children.length)
      if (isDir) {
        if (!children.length) {
          rejected.push({ path, reason: 'empty-directory' })
          continue
        }
        walk(children, path)
        continue
      }
      if (!resolveFromMap(componentMap, item.component)) {
        rejected.push({ path, component: item.component, reason: 'unknown-component' })
        continue
      }
      paths.push(path)
    }
  }
  walk(routers, '')
  return { paths, rejected }
}
