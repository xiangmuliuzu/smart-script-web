import MainLayout from '@/layout/MainLayout.vue'
import Dashboard from '@/views/dashboard/Dashboard.vue'
import ModuleScaffold from '@/views/common/ModuleScaffold.vue'
import ShortDrama from '@/views/operation/ShortDrama.vue'
import OperationOverview from '@/views/statistics/OperationOverview.vue'
import DetailQuery from '@/views/statistics/DetailQuery.vue'
import ReviewWorkbench from '@/views/copyright/ReviewWorkbench.vue'
import AiReviewRules from '@/views/copyright/AiReviewRules.vue'
import CopyrightCenter from '@/views/copyright/CopyrightCenter.vue'
import CopyrightAssets from '@/views/copyright/CopyrightAssets.vue'
import TradeWorks from '@/views/trade/TradeWorks.vue'
import AuthOrders from '@/views/trade/AuthOrders.vue'
import Partners from '@/views/trade/Partners.vue'
import AdConfig from '@/views/operation/AdConfig.vue'
import UserProfileRec from '@/views/operation/UserProfileRec.vue'
import UserManageProduct from '@/views/user/UserManage.vue'
import UserRealName from '@/views/user/realname/index.vue'
import UserMessage from '@/views/user/message/index.vue'
import UserFeedback from '@/views/user/feedback/index.vue'
import RiskManage from '@/views/risk/RiskManage.vue'
import SystemUser from '@/views/system/user/index.vue'
import SystemRole from '@/views/system/role/index.vue'
import SystemMenu from '@/views/system/menu/index.vue'
import SystemPost from '@/views/system/post/index.vue'
import SystemDict from '@/views/system/dict/index.vue'
import SystemConfigRuoYi from '@/views/system/config/index.vue'
import MonitorOperlog from '@/views/monitor/operlog/index.vue'
import MonitorLogininfor from '@/views/monitor/logininfor/index.vue'

/**
 * 服务端 component 标识 → 本地组件显式白名单。
 * 只回答“组件在哪里”；未登记标识一律拒绝。
 */
export const componentMap = {
  Layout: MainLayout,
  ParentView: MainLayout,

  'dashboard/Dashboard': Dashboard,
  'common/ModuleScaffold': ModuleScaffold,
  'operation/ShortDrama': ShortDrama,
  'statistics/OperationOverview': OperationOverview,
  'statistics/DetailQuery': DetailQuery,
  'copyright/ReviewWorkbench': ReviewWorkbench,
  'copyright/AiReviewRules': AiReviewRules,
  'copyright/CopyrightCenter': CopyrightCenter,
  'copyright/CopyrightAssets': CopyrightAssets,
  'trade/TradeWorks': TradeWorks,
  'trade/AuthOrders': AuthOrders,
  'trade/Partners': Partners,
  'operation/AdConfig': AdConfig,
  'operation/UserProfileRec': UserProfileRec,
  'user/UserManage': UserManageProduct,
  'user/realname/index': UserRealName,
  'user/message/index': UserMessage,
  'user/feedback/index': UserFeedback,
  'risk/RiskManage': RiskManage,

  'system/user/index': SystemUser,
  'system/role/index': SystemRole,
  'system/menu/index': SystemMenu,
  'system/post/index': SystemPost,
  'system/dict/index': SystemDict,
  'system/config/index': SystemConfigRuoYi,
  'monitor/operlog/index': MonitorOperlog,
  'monitor/logininfor/index': MonitorLogininfor
}

export function resolveComponent(component) {
  if (!component || typeof component !== 'string') return null
  return Object.prototype.hasOwnProperty.call(componentMap, component)
    ? componentMap[component]
    : null
}

export default componentMap
