/**
 * 交易模块（C）枚举常量集中管理。
 * 供 StatusTag、筛选下拉、表单选项统一取用，杜绝各页各写状态映射。
 *
 * 依据：
 * - 订单状态：PRD 9.3（本次采用）
 * - 合作方类型 / 授权类型 / 跟进状态：附件6.1 接口 2.35 / 2.25 / 2.38
 * - 询盘状态 / 报价状态：⚠️ 文档未给完整枚举，以下为《C模块开发清单》第2节建议值，
 *   属临时枚举，待后端确认并同步若依数据字典（sys_dict_data）后校正。
 *
 * tagType 取值须为 Element Plus el-tag 合法类型：success/info/warning/danger/primary。
 */

/** 订单状态（PRD 9.3）。contract_pending 及之后由 D 接手流转，C 只展示与前置流转 */
export const ORDER_STATUS = [
  { value: 'inquiry', label: '询盘中', tagType: 'info' },
  { value: 'quoted', label: '已报价', tagType: 'warning' },
  { value: 'confirmed', label: '已确认', tagType: 'primary' },
  { value: 'contract_pending', label: '待签约', tagType: 'warning' },
  { value: 'escrow_pending', label: '待托管', tagType: 'warning' },
  { value: 'delivering', label: '交割中', tagType: 'primary' },
  { value: 'completed', label: '已完成', tagType: 'success' },
  { value: 'cancelled', label: '已取消', tagType: 'info' },
  { value: 'refunded', label: '已退款', tagType: 'danger' }
]

/** 合作方类型（接口 2.35） */
export const PARTNER_TYPE = [
  { value: 'investor', label: '投资方' },
  { value: 'studio', label: '制作机构' },
  { value: 'platform', label: '发行平台' }
]

/** 授权类型（接口 2.25）。注意文档为下划线 non_exclusive，非连字符 */
export const LICENSE_TYPE = [
  { value: 'exclusive', label: '独家' },
  { value: 'non_exclusive', label: '非独家' },
  { value: 'adaptation', label: '改编' },
  { value: 'negotiable', label: '可议价' }
]

/** 商务跟进状态（接口 2.38） */
export const FOLLOW_STATUS = [
  { value: 'ongoing', label: '进行中', tagType: 'success' },
  { value: 'pending', label: '待跟进', tagType: 'warning' },
  { value: 'completed', label: '已完成', tagType: 'info' }
]

/** ⚠️ 临时：询盘状态（文档未给完整枚举，待后端确认） */
export const INQUIRY_STATUS = [
  { value: 'pending', label: '待回复', tagType: 'warning' },
  { value: 'accepted', label: '已接受', tagType: 'success' },
  { value: 'rejected', label: '已拒绝', tagType: 'danger' },
  { value: 'closed', label: '已关闭', tagType: 'info' },
  { value: 'quoted', label: '已报价', tagType: 'primary' },
  { value: 'deal', label: '已达成', tagType: 'success' }
]

/** ⚠️ 临时：报价状态（文档未给完整枚举，待后端确认） */
export const QUOTE_STATUS = [
  { value: 'pending', label: '待买方确认', tagType: 'warning' },
  { value: 'accepted', label: '已接受', tagType: 'success' },
  { value: 'rejected', label: '已拒绝', tagType: 'danger' },
  { value: 'expired', label: '已过期', tagType: 'info' }
]

/** 报价方角色（sys_quote.quoter_role）：卖方报价 / 买方议价 */
export const QUOTER_ROLE = [
  { value: 'seller', label: '卖方报价', tagType: 'primary' },
  { value: 'buyer', label: '买方议价', tagType: 'warning' }
]

/** 交易作品上架状态（接口 2.25：listingStatus） */
export const TRADE_WORK_STATUS = [
  { value: 'listed', label: '已上架', tagType: 'success' },
  { value: 'offline', label: '已下架', tagType: 'info' }
]

/** 商务跟进方式（接口 2.38：method） */
export const FOLLOW_METHOD = [
  { value: 'phone', label: '电话' },
  { value: 'email', label: '邮件' },
  { value: 'meeting', label: '面谈' }
]

/** 征集项目状态（sys_demand）⚠️ 临时，待后端确认 */
export const DEMAND_STATUS = [
  { value: 'open', label: '征集中', tagType: 'success' },
  { value: 'closed', label: '已截止', tagType: 'info' },
  { value: 'selected', label: '已选定', tagType: 'primary' }
]

/** 投稿状态（sys_demand_submission）⚠️ 临时，待后端确认 */
export const SUBMISSION_STATUS = [
  { value: 'submitted', label: '已投稿', tagType: 'warning' },
  { value: 'shortlisted', label: '入围', tagType: 'primary' },
  { value: 'accepted', label: '已选用', tagType: 'success' },
  { value: 'rejected', label: '未选用', tagType: 'info' }
]

/** 枚举注册表：StatusTag 按 type 名查表 */
export const ENUM_REGISTRY = {
  order: ORDER_STATUS,
  inquiry: INQUIRY_STATUS,
  quote: QUOTE_STATUS,
  quoterRole: QUOTER_ROLE,
  follow: FOLLOW_STATUS,
  partnerType: PARTNER_TYPE,
  license: LICENSE_TYPE,
  tradeWork: TRADE_WORK_STATUS,
  followMethod: FOLLOW_METHOD,
  demand: DEMAND_STATUS,
  submission: SUBMISSION_STATUS
}

/** 查枚举项 */
export function findEnum(type, value) {
  const list = ENUM_REGISTRY[type] || []
  return list.find((item) => item.value === value)
}

/** 取中文名，找不到回退原值 */
export function enumLabel(type, value) {
  const item = findEnum(type, value)
  return item ? item.label : (value ?? '-')
}

/** 取 el-tag 类型，找不到回退 info */
export function enumTagType(type, value) {
  const item = findEnum(type, value)
  return item?.tagType || 'info'
}

/** 取下拉选项 [{ value, label }] */
export function enumOptions(type) {
  return (ENUM_REGISTRY[type] || []).map(({ value, label }) => ({ value, label }))
}
