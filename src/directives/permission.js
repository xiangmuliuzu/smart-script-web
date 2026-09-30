import { useUserStore } from '@/stores/user'

/**
 * 按钮权限前端体验层：以 /getInfo 的 permissions 为准，支持 *:*:*。
 * 不得用角色名称绕过权限标识；真正授权由后端完成。
 */
export function registerPermissionDirective(app) {
  app.directive('permission', {
    mounted(el, binding) {
      const required = Array.isArray(binding.value) ? binding.value : [binding.value]
      const userStore = useUserStore()
      const allowed = required.some((permission) => userStore.hasPermission(permission))
      if (!allowed) {
        el.parentNode?.removeChild(el)
      }
    }
  })
}
