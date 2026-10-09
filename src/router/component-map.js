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
import CopyrightSealReview from '@/views/copyright/SealReview.vue'
import WithdrawReview from '@/views/copyright/WithdrawReview.vue'
import ContractManage from '@/views/copyright/ContractManage.vue'
import SettlementManage from '@/views/copyright/SettlementManage.vue'
import FinanceAbnormal from '@/views/copyright/FinanceAbnormal.vue'
import CopyrightCertManage from '@/views/copyright/CopyrightCertManage.vue'
import SealManage from '@/views/copyright/SealManage.vue'
import ContentCategory from '@/views/content/category/index.vue'
import ContentTag from '@/views/content/tag/index.vue'
import ContentWork from '@/views/content/work/index.vue'
import ContentBookstore from '@/views/content/bookstore/index.vue'
import ContentRanking from '@/views/content/ranking/index.vue'
import ContentBanner from '@/views/content/banner/index.vue'
import ContentWorkfile from '@/views/content/workfile/index.vue'
import ExternalDramaChannel from '@/views/content/external-drama/channel/index.vue'
import ExternalDramaContent from '@/views/content/external-drama/drama/index.vue'
import ExternalDramaBind from '@/views/content/external-drama/bind/index.vue'
import ExternalDramaStatus from '@/views/content/external-drama/status/index.vue'
import ExternalDramaStats from '@/views/content/external-drama/stats/index.vue'
import TradeWorks from '@/views/trade/TradeWorks.vue'
import AuthOrders from '@/views/trade/AuthOrders.vue'
import Partners from '@/views/trade/Partners.vue'
import Inquiry from '@/views/trade/Inquiry.vue'
import Quote from '@/views/trade/Quote.vue'
import DemandTags from '@/views/trade/DemandTags.vue'
import FollowUp from '@/views/trade/FollowUp.vue'
import Demand from '@/views/trade/Demand.vue'
import AdConfig from '@/views/operation/AdConfig.vue'
import UserProfileRec from '@/views/operation/UserProfileRec.vue'
import UserManageProduct from '@/views/user/UserManage.vue'
import UserRealName from '@/views/user/realname/index.vue'
import UserMessage from '@/views/user/message/index.vue'
import MessagesAnnouncements from '@/views/support/MessagesAnnouncements.vue'
import ReceivedAnnouncements from '@/views/support/ReceivedAnnouncements.vue'
import UserFeedback from '@/views/user/feedback/index.vue'
import RiskManage from '@/views/risk/RiskManage.vue'
import AiOperations from '@/views/system/AiOperations.vue'
import MonitorOperlog from '@/views/monitor/operlog/index.vue'
import MonitorLogininfor from '@/views/monitor/logininfor/index.vue'
import ChatSessions from '@/views/chat/ChatSessions.vue'
import ChatDetail from '@/views/chat/ChatDetail.vue'

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
  // 兼容后台历史菜单标识，避免版权中心页面被误判为未知组件。
  'copyright/center-config': CopyrightCenter,
  'copyright/CopyrightAssets': CopyrightAssets,
  'copyright/SealReview': CopyrightSealReview,
  'copyright/WithdrawReview': WithdrawReview,
  'copyright/ContractManage': ContractManage,
  'copyright/SettlementManage': SettlementManage,
  'copyright/FinanceAbnormal': FinanceAbnormal,
  'copyright/CopyrightCertManage': CopyrightCertManage,
  'copyright/SealManage': SealManage,
  'content/category/index': ContentCategory,
  'content/tag/index': ContentTag,
  'content/work/index': ContentWork,
  'content/bookstore/index': ContentBookstore,
  'content/ranking/index': ContentRanking,
  'content/banner/index': ContentBanner,
  'content/workfile/index': ContentWorkfile,
  'content/external-drama/channel/index': ExternalDramaChannel,
  'content/external-drama/drama/index': ExternalDramaContent,
  'content/external-drama/bind/index': ExternalDramaBind,
  'content/external-drama/status/index': ExternalDramaStatus,
  'content/external-drama/stats/index': ExternalDramaStats,
  'trade/TradeWorks': TradeWorks,
  'trade/AuthOrders': AuthOrders,
  'trade/Partners': Partners,
  'trade/Inquiry': Inquiry,
  'trade/Quote': Quote,
  'trade/DemandTags': DemandTags,
  'trade/FollowUp': FollowUp,
  'trade/Demand': Demand,
  'operation/AdConfig': AdConfig,
  'operation/UserProfileRec': UserProfileRec,
  'user/UserManage': UserManageProduct,
  'user/realname/index': UserRealName,
  'user/message/index': UserMessage,
  'support/MessagesAnnouncements': MessagesAnnouncements,
  'support/ReceivedAnnouncements': ReceivedAnnouncements,
  'user/feedback/index': UserFeedback,
  'risk/RiskManage': RiskManage,
  'system/AiOperations': AiOperations,

  // 系统管理下的用户/角色/菜单/岗位/字典/参数页面已不再需要（2026-10-09 菜单精简，
  // 数据库菜单见 smartscript_full_init.sql 第 7 部分）：用户管理由用户中心覆盖，
  // 其余为开发自管配置。页面与 api 文件已删除，此处不得再登记对应映射。

  'monitor/operlog/index': MonitorOperlog,
  'monitor/logininfor/index': MonitorLogininfor,

  // A3 用户沟通（管理端菜单 component 标识，见 A3_20261008_002__chat_menu.sql）
  'chat/ChatSessions': ChatSessions,
  'chat/ChatDetail': ChatDetail
}

export function resolveComponent(component) {
  if (!component || typeof component !== 'string') return null
  return Object.prototype.hasOwnProperty.call(componentMap, component)
    ? componentMap[component]
    : null
}

export default componentMap
