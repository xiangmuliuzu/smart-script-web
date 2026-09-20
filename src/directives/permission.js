import { useUserStore } from '@/stores/user'

/**
 * 若依按钮权限的轻量前端兜底。
 * 真正的权限判断必须由后端完成，前端指令只负责隐藏无权限按钮。
 */
export function registerPermissionDirective(app) {
  app.directive('permission', {
    mounted(el, binding) {
      const required = Array.isArray(binding.value) ? binding.value : [binding.value]
      const userStore = useUserStore()
      const isSuperAdmin = userStore.roles.includes('admin') || userStore.roles.includes('super_admin')
      const allowed = isSuperAdmin || required.some((permission) => userStore.hasPermission(permission))

      if (!allowed) {
        el.parentNode?.removeChild(el)
      }
    }
  })
}
