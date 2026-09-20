import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      // 数据总览（首页）
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '数据总览', icon: 'DataLine' }
      },

      // 内容与作品
      {
        path: 'content/works',
        name: 'ContentWorks',
        component: () => import('@/views/common/ModuleScaffold.vue'),
        meta: {
          title: '作品内容管理',
          icon: 'Document',
          moduleConfig: {
            eyebrow: '内容与作品',
            title: '作品内容管理',
            description: '管理剧本、章节、分类标签和作品展示状态，为审核、书城和商务模块提供统一内容入口。',
            primaryAction: '新增作品',
            kpis: [
              { label: '作品总数', value: '3,842', trend: '+12.6%' },
              { label: '待完善资料', value: '86', trend: '需要处理' },
              { label: '已上架', value: '2,917', trend: '+8.4%' },
              { label: '草稿', value: '421', trend: '作者自存' }
            ],
            columns: ['作品名称', '作者', '分类', '章节数', '展示状态', '更新时间'],
            rows: [
              { name: '都市迷途', owner: '张编剧', category: '都市 / 悬疑', count: '24', status: '已上架', time: '2026-09-20 09:30' },
              { name: '山河故人', owner: '李创作', category: '古装 / 情感', count: '18', status: '待完善', time: '2026-09-19 16:12' },
              { name: '末日黎明', owner: '王大锤', category: '科幻 / 短剧', count: '36', status: '审核中', time: '2026-09-19 11:05' }
            ],
            actions: ['查看', '编辑', '上下架']
          }
        }
      },
      {
        path: 'content/categories',
        name: 'CategoryManage',
        component: () => import('@/views/common/ModuleScaffold.vue'),
        meta: {
          title: '分类与标签',
          icon: 'Collection',
          moduleConfig: {
            eyebrow: '内容与作品',
            title: '分类与标签',
            description: '统一维护书城分类、题材标签和作品筛选项，避免 APP 与 PC 各自维护一套字典。',
            primaryAction: '新增分类',
            kpis: [
              { label: '一级分类', value: '8', trend: '已启用' },
              { label: '题材标签', value: '46', trend: '+4 本月' },
              { label: '待审核标签', value: '7', trend: '需要处理' },
              { label: '停用项', value: '3', trend: '可清理' }
            ],
            columns: ['名称', '类型', '关联作品', '排序', '状态', '更新时间'],
            rows: [
              { name: '都市情感', owner: '分类', category: '一级分类', count: '862', status: '启用', time: '2026-09-20 08:20' },
              { name: '悬疑反转', owner: '标签', category: '题材标签', count: '438', status: '启用', time: '2026-09-18 14:06' },
              { name: '漫剧', owner: '分类', category: '内容分类', count: '126', status: '待配置', time: '2026-09-17 10:42' }
            ],
            actions: ['查看', '编辑', '停用']
          }
        }
      },
      {
        path: 'content/ranking',
        name: 'ContentRanking',
        component: () => import('@/views/common/ModuleScaffold.vue'),
        meta: {
          title: '排行榜管理',
          icon: 'Trophy',
          moduleConfig: {
            eyebrow: '内容与作品',
            title: '排行榜管理',
            description: '配置书城排行榜的统计周期、榜单类型和展示顺序，为 APP 书城提供统一榜单数据。',
            primaryAction: '新增榜单',
            kpis: [
              { label: '启用榜单', value: '6', trend: '运行中' },
              { label: '候选作品', value: '1,284', trend: '自动计算' },
              { label: '今日更新', value: '6', trend: '已完成' },
              { label: '异常榜单', value: '0', trend: '运行正常' }
            ],
            columns: ['榜单名称', '榜单类型', '统计周期', '作品数量', '状态', '更新时间'],
            rows: [
              { name: '热门剧本榜', owner: '热度榜', category: '近 7 日', count: '50', status: '启用', time: '2026-09-20 08:00' },
              { name: '新作潜力榜', owner: '新作榜', category: '近 30 日', count: '30', status: '启用', time: '2026-09-20 08:00' },
              { name: '漫剧热播榜', owner: '漫剧榜', category: '近 24 小时', count: '20', status: '草稿', time: '2026-09-19 16:20' }
            ],
            actions: ['查看', '编辑', '启停']
          }
        }
      },
      {
        path: 'content/external-video',
        name: 'ExternalVideo',
        component: () => import('@/views/operation/ShortDrama.vue'),
        meta: {
          title: '外部漫剧发行',
          icon: 'VideoPlay'
        }
      },
      {
        path: 'operation/short-drama',
        redirect: '/content/external-video',
        meta: { hidden: true }
      },

      // 数据统计 - 运营数据总览
      {
        path: 'statistics/overview',
        name: 'OperationOverview',
        component: () => import('@/views/statistics/OperationOverview.vue'),
        meta: { title: '运营数据总览', icon: 'DataLine' }
      },
      
      // 数据统计 - 明细数据查询
      {
        path: 'statistics/detail',
        name: 'DetailQuery',
        component: () => import('@/views/statistics/DetailQuery.vue'),
        meta: { title: '明细数据查询', icon: 'DataLine' }
      },
      
      // 版权审核管理 - 作品审核工作台
      {
        path: 'copyright/review',
        name: 'ReviewWorkbench',
        component: () => import('@/views/copyright/ReviewWorkbench.vue'),
        meta: { title: '作品审核工作台', icon: 'Stamp' }
      },
      
      // 版权审核管理 - AI审核规则配置
      {
        path: 'copyright/review-rules',
        name: 'AiReviewRules',
        component: () => import('@/views/copyright/AiReviewRules.vue'),
        meta: { title: 'AI审核规则配置', icon: 'Stamp' }
      },
      
      // 版权审核管理 - AI初审+人工复核
      {
        path: 'copyright/ai-review',
        name: 'AiReview',
        component: () => import('@/views/copyright/ReviewWorkbench.vue'),
        meta: { title: 'AI初审+人工复核', icon: 'Stamp' }
      },
      
      // 版权审核管理 - 版权中心对接
      {
        path: 'copyright/center',
        name: 'CopyrightCenter',
        component: () => import('@/views/copyright/CopyrightCenter.vue'),
        meta: { title: '版权中心对接', icon: 'Stamp' }
      },
      
      // 版权审核管理 - 版权资产管理
      {
        path: 'copyright/assets',
        name: 'CopyrightAssets',
        component: () => import('@/views/copyright/CopyrightAssets.vue'),
        meta: { title: '版权资产管理', icon: 'Stamp' }
      },
      {
        path: 'copyright/seals',
        name: 'SealReview',
        component: () => import('@/views/common/ModuleScaffold.vue'),
        meta: {
          title: '印章审核',
          icon: 'Stamp',
          moduleConfig: {
            eyebrow: '版权审核管理',
            title: '印章审核',
            description: '审核用户提交的个人印章和审核材料，审核通过后同步到 APP 个人资料。',
            primaryAction: '导出审核记录',
            kpis: [
              { label: '待审核', value: '18', trend: '优先处理' },
              { label: '审核中', value: '6', trend: '材料补充' },
              { label: '本月通过', value: '124', trend: '+16.3%' },
              { label: '驳回', value: '9', trend: '需查看原因' }
            ],
            columns: ['申请编号', '申请人', '印章名称', '材料完整度', '状态', '提交时间'],
            rows: [
              { name: 'SEAL-20260920-001', owner: '张编剧', category: '张某某个人印章', count: '完整', status: '待审核', time: '2026-09-20 10:15' },
              { name: 'SEAL-20260919-014', owner: '李创作', category: '工作室印章', count: '待补材料', status: '补充材料', time: '2026-09-19 15:42' },
              { name: 'SEAL-20260918-006', owner: '王大锤', category: '王某某个人印章', count: '完整', status: '已通过', time: '2026-09-18 09:26' }
            ],
            actions: ['查看材料', '通过', '驳回']
          }
        }
      },
      
      // 交易商务管理 - 交易作品管理
      {
        path: 'trade/works',
        name: 'TradeWorks',
        component: () => import('@/views/trade/TradeWorks.vue'),
        meta: { title: '交易作品管理', icon: 'Sell' }
      },
      
      // 交易商务管理 - 授权订单管理
      {
        path: 'trade/orders',
        name: 'AuthOrders',
        component: () => import('@/views/trade/AuthOrders.vue'),
        meta: { title: '授权订单管理', icon: 'Sell' }
      },
      
      // 交易商务管理 - 合作方管理
      {
        path: 'trade/partners',
        name: 'Partners',
        component: () => import('@/views/trade/Partners.vue'),
        meta: { title: '合作方管理', icon: 'Sell' }
      },
      {
        path: 'trade/inquiries',
        name: 'TradeInquiries',
        component: () => import('@/views/common/ModuleScaffold.vue'),
        meta: {
          title: '询盘与报价',
          icon: 'ChatLineSquare',
          moduleConfig: {
            eyebrow: '交易商务管理',
            title: '询盘与报价',
            description: '管理投资方和制作机构的合作需求、报价记录与线下谈判进度，确认后再进入授权订单。',
            primaryAction: '新建询盘',
            kpis: [
              { label: '待响应询盘', value: '23', trend: '需要跟进' },
              { label: '报价中', value: '14', trend: '商务处理中' },
              { label: '线下谈判', value: '8', trend: '本周新增 2' },
              { label: '本月达成', value: '19', trend: '+11.8%' }
            ],
            columns: ['询盘编号', '需求方', '关联作品', '当前报价', '状态', '更新时间'],
            rows: [
              { name: 'INQ-20260920-008', owner: '星河影视', category: '都市迷途', count: '¥180,000', status: '待响应', time: '2026-09-20 10:20' },
              { name: 'INQ-20260919-004', owner: '远山传媒', category: '末日黎明', count: '¥260,000', status: '线下谈判', time: '2026-09-19 15:30' },
              { name: 'INQ-20260918-012', owner: '光影工作室', category: '山河故人', count: '¥120,000', status: '已达成', time: '2026-09-18 17:05' }
            ],
            actions: ['查看', '记录跟进', '转授权订单']
          }
        }
      },
      {
        path: 'trade/contracts',
        name: 'ContractSettlement',
        component: () => import('@/views/common/ModuleScaffold.vue'),
        meta: {
          title: '合同与结算',
          icon: 'DocumentCopy',
          moduleConfig: {
            eyebrow: '交易商务管理',
            title: '合同与结算',
            description: '集中查看合同草稿、签署状态、托管交割、分成核算和提现处理结果。',
            primaryAction: '导出结算报表',
            kpis: [
              { label: '待生成合同', value: '12', trend: '订单已达成' },
              { label: '待签署', value: '8', trend: '需要跟进' },
              { label: '待结算金额', value: '¥286,400', trend: '+9.8%' },
              { label: '提现待审核', value: '15', trend: '财务处理' }
            ],
            columns: ['合同编号', '关联订单', '合作双方', '合同状态', '结算状态', '更新时间'],
            rows: [
              { name: 'CON-20260920-003', owner: '都市迷途授权订单', category: '张编剧 / 星河影视', count: '待签署', status: '待结算', time: '2026-09-20 09:46' },
              { name: 'CON-20260919-011', owner: '末日黎明翻拍授权', category: '王大锤 / 远山传媒', count: '已签署', status: '待交割', time: '2026-09-19 17:10' },
              { name: 'CON-20260917-008', owner: '山河故人授权订单', category: '李创作 / 光影工作室', count: '已归档', status: '已结算', time: '2026-09-17 13:28' }
            ],
            actions: ['查看合同', '推进状态', '查看结算']
          }
        }
      },
      
      // 平台运营管理 - 广告运营配置
      {
        path: 'operation/ad-config',
        name: 'AdConfig',
        component: () => import('@/views/operation/AdConfig.vue'),
        meta: { title: '广告运营配置', icon: 'Operation' }
      },
      
      // 平台运营管理 - 用户画像与推荐配置
      {
        path: 'operation/user-profile-rec',
        name: 'UserProfileRec',
        component: () => import('@/views/operation/UserProfileRec.vue'),
        meta: { title: '用户画像与推荐配置', icon: 'Operation' }
      },
      
      // 用户与创作者管理
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/UserManage.vue'),
        meta: { title: '用户与创作者管理', icon: 'User' }
      },
      
      // 全局风控管理
      {
        path: 'risk',
        name: 'Risk',
        component: () => import('@/views/risk/RiskManage.vue'),
        meta: { title: '全局风控管理', icon: 'Warning' }
      },
      {
        path: 'ai/operations',
        name: 'AiOperations',
        component: () => import('@/views/common/ModuleScaffold.vue'),
        meta: {
          title: 'AI 创作与次数',
          icon: 'MagicStick',
          moduleConfig: {
            eyebrow: 'AI 创作与福利',
            title: 'AI 创作与次数',
            description: '配置 AI 辅助创作次数、积分兑换和广告奖励规则，查看消耗与失败记录。',
            primaryAction: '新增规则',
            kpis: [
              { label: '今日调用次数', value: '2,184', trend: '+18.4%' },
              { label: '剩余可用次数', value: '9,642', trend: '平台额度' },
              { label: '积分兑换次数', value: '438', trend: '今日' },
              { label: '广告奖励次数', value: '276', trend: '今日' }
            ],
            columns: ['规则名称', '获得方式', '奖励次数', '每日上限', '状态', '更新时间'],
            rows: [
              { name: '积分兑换 AI 次数', owner: '积分兑换', category: '10 积分 / 次', count: '5 次 / 日', status: '启用', time: '2026-09-20 08:00' },
              { name: '观看广告奖励', owner: '广告激励', category: '1 次 / 完成', count: '3 次 / 日', status: '启用', time: '2026-09-19 16:20' },
              { name: '新用户体验额度', owner: '新用户', category: '3 次 / 账号', count: '一次性', status: '启用', time: '2026-09-18 11:30' }
            ],
            actions: ['查看', '编辑', '启停']
          }
        }
      },
      {
        path: 'support/welfare',
        name: 'WelfareConfig',
        component: () => import('@/views/common/ModuleScaffold.vue'),
        meta: {
          title: '福利与积分配置',
          icon: 'Present',
          moduleConfig: {
            eyebrow: '运营支撑',
            title: '福利与积分配置',
            description: '配置积分获取、AI 次数兑换和运营活动奖励，记录规则变更和生效范围。',
            primaryAction: '新增福利规则',
            kpis: [
              { label: '积分总余额', value: '1,284,620', trend: '+6.2%' },
              { label: '今日发放', value: '38,420', trend: '积分' },
              { label: '今日消耗', value: '21,806', trend: '积分' },
              { label: '生效规则', value: '9', trend: '运行中' }
            ],
            columns: ['规则名称', '触发场景', '奖励内容', '适用用户', '状态', '更新时间'],
            rows: [
              { name: '每日登录奖励', owner: '每日登录', category: '+5 积分', count: '全部用户', status: '启用', time: '2026-09-20 08:00' },
              { name: '完成实名认证', owner: '认证完成', category: '+50 积分', count: '新用户', status: '启用', time: '2026-09-18 10:12' },
              { name: '作品首次提交', owner: '首次投稿', category: '+100 积分', count: '创作者', status: '草稿', time: '2026-09-17 15:40' }
            ],
            actions: ['查看', '编辑', '启停']
          }
        }
      },
      {
        path: 'support/messages',
        name: 'SupportMessages',
        component: () => import('@/views/common/ModuleScaffold.vue'),
        meta: {
          title: '消息与公告',
          icon: 'Bell',
          moduleConfig: {
            eyebrow: '运营支撑',
            title: '消息与公告',
            description: '维护 APP 消息、系统公告和审核结果通知，统一配置发送范围、发送时间和已读状态。',
            primaryAction: '新建公告',
            kpis: [
              { label: '已发布公告', value: '18', trend: '本月' },
              { label: '待发送', value: '4', trend: '需要确认' },
              { label: '未读消息', value: '2,816', trend: '用户侧' },
              { label: '发送成功率', value: '99.6%', trend: '运行正常' }
            ],
            columns: ['标题', '消息类型', '发送范围', '发送状态', '状态', '更新时间'],
            rows: [
              { name: '版权审核规则调整通知', owner: '系统公告', category: '全部用户', count: '已发送', status: '已通过', time: '2026-09-20 09:00' },
              { name: 'AI 辅助创作次数活动', owner: '福利通知', category: '创作者', count: '定时发送', status: '启用', time: '2026-09-19 16:30' },
              { name: '印章审核结果通知', owner: '业务通知', category: '指定用户', count: '待发送', status: '草稿', time: '2026-09-19 14:12' }
            ],
            actions: ['查看', '编辑', '发送']
          }
        }
      },

      
      // 权限管理
      {
        path: 'system/permission',
        name: 'PermissionManage',
        component: () => import('@/views/system/PermissionManage.vue'),
        meta: { title: '权限管理', icon: 'Lock' }
      },
      
      // 系统配置
      {
        path: 'system/config',
        name: 'SystemConfig',
        component: () => import('@/views/system/SystemConfig.vue'),
        meta: { title: '系统配置', icon: 'Setting' }
      },
      
      // 操作日志
      {
        path: 'system/logs',
        name: 'OperationLog',
        component: () => import('@/views/system/OperationLog.vue'),
        meta: { title: '操作日志', icon: 'Document' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 剧云策管理后台` : '剧云策管理后台'
  
  // 登录页直接放行
  if (to.path === '/login') {
    if (token) {
      next('/dashboard')
    } else {
      next()
    }
    return
  }
  
  // 其他页面需要登录
  if (!token) {
    next('/login')
  } else {
    next()
  }
})

export default router
