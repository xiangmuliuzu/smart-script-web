import request from '@/utils/request'
import {
  isTradeMock,
  mockTradeWorks, mockCreateTradeWork, mockUpdateTradeWork,
  mockOrders, mockOrderDetail, mockOrderStatusLog,
  mockPartners, mockCreatePartner, mockUpdatePartner,
  mockDemandTags, mockCreateDemandTag, mockUpdateDemandTag, mockDeleteDemandTag,
  mockFollowUps, mockCreateFollowUp,
  mockInquiries, mockInquiryDetail, mockFollowUpInquiry, mockConvertInquiryToOrder,
  mockQuotes,
  mockDemands, mockDemandSubmissions
} from '@/api/trade.mock'
import {
  adaptTradeWorks, adaptOrders, adaptOrderDetail, adaptOrderStatusLog,
  adaptPartners, adaptFollowUps, adaptInquiries, adaptInquiryDetail, adaptQuotes,
  adaptDemands, adaptDemandSubmissions
} from '@/api/trade.adapter'

/**
 * 交易商务（C 模块）PC 管理端 API。
 * 前缀 /api/v1/admin，返回兼容若依 AjaxResult(code/msg/data) 与 TableDataInfo(code/msg/rows/total)。
 *
 * 数据接入：由 VITE_TRADE_MOCK 开关控制（仅本地开发生效）。开关开启时返回 trade.mock.js 假数据，
 * 关闭后走真实请求，页面组件代码不改。
 *
 * 路径依据：
 * - 已定义接口（附件6.1）：2.25-2.29 交易作品/订单，2.35-2.38 合作方/需求标签/商务跟进。
 * - ⚠️ 文档缺口接口（《C模块开发清单》3.2，路径待后端确认）：询盘、报价/议价、订单状态日志、征集项目。
 */
const PREFIX = '/api/v1/admin'

/* ==================== 交易作品（2.25 / 2.26 / 2.27）==================== */

/** 2.25 交易作品列表 GET /trade/works */
export function getTradeWorks(params) {
  if (isTradeMock()) return Promise.resolve(mockTradeWorks(params))
  return request({ url: `${PREFIX}/trade/works`, method: 'get', params }).then(adaptTradeWorks)
}

/** 2.26 上架新作品到交易大厅 POST /trade/works（作品须已审核通过） */
export function createTradeWork(data) {
  if (isTradeMock()) return Promise.resolve(mockCreateTradeWork(data))
  return request({ url: `${PREFIX}/trade/works`, method: 'post', data })
}

/** 2.27 编辑交易设置 PUT /trade/works/{tradeWorkId} */
export function updateTradeWork(tradeWorkId, data) {
  if (isTradeMock()) return Promise.resolve(mockUpdateTradeWork(tradeWorkId, data))
  return request({ url: `${PREFIX}/trade/works/${tradeWorkId}`, method: 'put', data })
}

/* ==================== 授权订单（2.28 / 2.29）==================== */

/** 2.28 授权订单列表 GET /trade/orders */
export function getOrderList(params) {
  if (isTradeMock()) return Promise.resolve(mockOrders(params))
  return request({ url: `${PREFIX}/trade/orders`, method: 'get', params }).then(adaptOrders)
}

/**
 * 2.29 订单详情 GET /trade/orders/{orderId}
 * 后端详情端点不含状态流转记录，需并行拉取 status-log 端点后合并（合同/托管/结算属 D）。
 */
export function getOrderDetail(orderId) {
  if (isTradeMock()) return Promise.resolve(mockOrderDetail(orderId))
  return Promise.all([
    request({ url: `${PREFIX}/trade/orders/${orderId}`, method: 'get' }),
    request({ url: `${PREFIX}/trade/orders/${orderId}/status-log`, method: 'get' }).catch(() => ({ rows: [] }))
  ]).then(([detail, log]) => adaptOrderDetail(detail, log))
}

/** ⚠️ 订单状态流转日志（文档缺口，路径待后端确认）GET /trade/orders/{orderId}/status-log */
export function getOrderStatusLog(orderId) {
  if (isTradeMock()) return Promise.resolve(mockOrderStatusLog(orderId))
  return request({ url: `${PREFIX}/trade/orders/${orderId}/status-log`, method: 'get' }).then(adaptOrderStatusLog)
}

/* ==================== 合作方 / 需求标签 / 商务跟进（2.35-2.38）==================== */

/** 2.35 合作方列表 GET /trade/partners */
export function getPartnerList(params) {
  if (isTradeMock()) return Promise.resolve(mockPartners(params))
  return request({ url: `${PREFIX}/trade/partners`, method: 'get', params }).then(adaptPartners)
}

/** 2.36 新增合作方 POST /trade/partners */
export function createPartner(data) {
  if (isTradeMock()) return Promise.resolve(mockCreatePartner(data))
  return request({ url: `${PREFIX}/trade/partners`, method: 'post', data })
}

/** 编辑合作方 PUT /trade/partners/{partnerId}（修复：编辑态此前误走新增导致重复插入） */
export function updatePartner(partnerId, data) {
  if (isTradeMock()) return Promise.resolve(mockUpdatePartner(partnerId, data))
  return request({ url: `${PREFIX}/trade/partners/${partnerId}`, method: 'put', data })
}

/** 2.37 需求标签列表 GET /trade/partners/tags */
export function getDemandTags(params) {
  if (isTradeMock()) return Promise.resolve(mockDemandTags(params))
  return request({ url: `${PREFIX}/trade/partners/tags`, method: 'get', params })
}

/** 2.37 新增需求标签 POST /trade/partners/tags */
export function createDemandTag(data) {
  if (isTradeMock()) return Promise.resolve(mockCreateDemandTag(data))
  return request({ url: `${PREFIX}/trade/partners/tags`, method: 'post', data })
}

/** ⚠️ 编辑需求标签（文档 2.37 仅定义 GET/POST，PUT 为前端预留桩，路径待后端确认） */
export function updateDemandTag(tagId, data) {
  if (isTradeMock()) return Promise.resolve(mockUpdateDemandTag(tagId, data))
  return request({ url: `${PREFIX}/trade/partners/tags/${tagId}`, method: 'put', data })
}

/** ⚠️ 删除需求标签（文档 2.37 仅定义 GET/POST，DELETE 为前端预留桩，路径待后端确认） */
export function deleteDemandTag(tagId) {
  if (isTradeMock()) return Promise.resolve(mockDeleteDemandTag(tagId))
  return request({ url: `${PREFIX}/trade/partners/tags/${tagId}`, method: 'delete' })
}

/** 2.38 商务跟进记录列表 GET /trade/partners/follow-ups */
export function getFollowUps(params) {
  if (isTradeMock()) return Promise.resolve(mockFollowUps(params))
  return request({ url: `${PREFIX}/trade/partners/follow-ups`, method: 'get', params }).then(adaptFollowUps)
}

/** 2.38 新增商务跟进记录 POST /trade/partners/follow-ups */
export function createFollowUp(data) {
  if (isTradeMock()) return Promise.resolve(mockCreateFollowUp(data))
  return request({ url: `${PREFIX}/trade/partners/follow-ups`, method: 'post', data })
}

/* ==================== ⚠️ 询盘（文档缺口 3.2，前端预留桩，路径待后端确认）==================== */

/** 询盘列表 GET /trade/inquiry/list */
export function getInquiryList(params) {
  if (isTradeMock()) return Promise.resolve(mockInquiries(params))
  return request({ url: `${PREFIX}/trade/inquiry/list`, method: 'get', params }).then(adaptInquiries)
}

/** 询盘详情 GET /trade/inquiry/detail/{id} */
export function getInquiryDetail(id) {
  if (isTradeMock()) return Promise.resolve(mockInquiryDetail(id))
  return request({ url: `${PREFIX}/trade/inquiry/detail/${id}`, method: 'get' }).then(adaptInquiryDetail)
}

/** 询盘跟进记录 POST /trade/inquiry/follow-up/{id} */
export function followUpInquiry(id, data) {
  if (isTradeMock()) return Promise.resolve(mockFollowUpInquiry(id, data))
  return request({ url: `${PREFIX}/trade/inquiry/follow-up/${id}`, method: 'post', data })
}

/** 询盘转授权订单 POST /trade/inquiry/convert-order/{id} */
export function convertInquiryToOrder(id, data) {
  if (isTradeMock()) return Promise.resolve(mockConvertInquiryToOrder(id, data))
  return request({ url: `${PREFIX}/trade/inquiry/convert-order/${id}`, method: 'post', data })
}

/** 发起询盘 POST /trade/inquiry（分工条目 9，PRD APP-TRADE-02） */
export function createInquiry(data) {
  if (isTradeMock()) return Promise.resolve({ code: 200, msg: 'success' })
  return request({ url: `${PREFIX}/trade/inquiry`, method: 'post', data })
}

/** 接受询盘 PUT /trade/inquiry/{id}/accept（仅 pending 可接受） */
export function acceptInquiry(id) {
  if (isTradeMock()) return Promise.resolve({ code: 200, msg: 'success' })
  return request({ url: `${PREFIX}/trade/inquiry/${id}/accept`, method: 'put' })
}

/** 拒绝询盘 PUT /trade/inquiry/{id}/reject（仅 pending 可拒绝） */
export function rejectInquiry(id) {
  if (isTradeMock()) return Promise.resolve({ code: 200, msg: 'success' })
  return request({ url: `${PREFIX}/trade/inquiry/${id}/reject`, method: 'put' })
}

/** 关闭询盘 PUT /trade/inquiry/{id}/close（pending/accepted/quoted/rejected 可关闭） */
export function closeInquiry(id) {
  if (isTradeMock()) return Promise.resolve({ code: 200, msg: 'success' })
  return request({ url: `${PREFIX}/trade/inquiry/${id}/close`, method: 'put' })
}

/* ==================== ⚠️ 报价/议价（文档缺口，路径待后端确认）==================== */

/** 报价/议价记录列表 GET /trade/quote/list */
export function getQuoteList(params) {
  if (isTradeMock()) return Promise.resolve(mockQuotes(params))
  return request({ url: `${PREFIX}/trade/quote/list`, method: 'get', params }).then(adaptQuotes)
}

/** 接受报价 PUT /trade/quote/{quoteId}/accept */
export function acceptQuote(quoteId) {
  if (isTradeMock()) return Promise.resolve({ code: 200, msg: 'success' })
  return request({ url: `${PREFIX}/trade/quote/${quoteId}/accept`, method: 'put' })
}

/** 拒绝报价 PUT /trade/quote/{quoteId}/reject */
export function rejectQuote(quoteId) {
  if (isTradeMock()) return Promise.resolve({ code: 200, msg: 'success' })
  return request({ url: `${PREFIX}/trade/quote/${quoteId}/reject`, method: 'put' })
}

/** 提交报价 POST /trade/quote（分工条目 17，卖方报价） */
export function createQuote(data) {
  if (isTradeMock()) return Promise.resolve({ code: 200, msg: 'success' })
  return request({ url: `${PREFIX}/trade/quote`, method: 'post', data })
}

/** 修改报价 PUT /trade/quote/{quoteId}（分工条目 18，仅 pending 可改） */
export function modifyQuote(quoteId, data) {
  if (isTradeMock()) return Promise.resolve({ code: 200, msg: 'success' })
  return request({ url: `${PREFIX}/trade/quote/${quoteId}`, method: 'put', data })
}

/** 买方议价 POST /trade/quote/counter-offer（分工条目 19，新增 buyer 报价行保留历史） */
export function counterOffer(data) {
  if (isTradeMock()) return Promise.resolve({ code: 200, msg: 'success' })
  return request({ url: `${PREFIX}/trade/quote/counter-offer`, method: 'post', data })
}

/* ==================== ⚠️ 征集项目（文档缺口，对应 sys_demand / sys_demand_submission）==================== */

/** 征集项目列表 GET /trade/demand/list */
export function getDemandList(params) {
  if (isTradeMock()) return Promise.resolve(mockDemands(params))
  return request({ url: `${PREFIX}/trade/demand/list`, method: 'get', params }).then(adaptDemands)
}

/** 征集项目投稿作品 GET /trade/demand/{demandId}/submissions */
export function getDemandSubmissions(demandId) {
  if (isTradeMock()) return Promise.resolve(mockDemandSubmissions(demandId))
  return request({ url: `${PREFIX}/trade/demand/${demandId}/submissions`, method: 'get' }).then(adaptDemandSubmissions)
}

/** 发布征集令 POST /trade/demand */
export function createDemand(data) {
  if (isTradeMock()) return Promise.resolve({ code: 200, msg: 'success' })
  return request({ url: `${PREFIX}/trade/demand`, method: 'post', data })
}
