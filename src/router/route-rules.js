/**
 * 兼容转发：生产逻辑已收敛到 utils/ruoyi-response.js（页面与 request.js 使用）。
 * 请直接从 '@/utils/ruoyi-response' 引用，避免测试与生产分叉。
 */
export {
  joinPath,
  isExternal,
  resolveFromMap,
  hasPermission,
  safeRedirectPath,
  collectRolePayload,
  collectUserUpdatePayload,
  adaptNodesForTest
} from '../utils/ruoyi-response.js'
