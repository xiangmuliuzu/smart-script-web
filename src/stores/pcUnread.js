import { defineStore } from 'pinia'
import { getUnreadCount } from '@/api/pcUser'
import { unreadBadgeText } from '@/utils/pcFormat'

/**
 * 公共消息角标统计（开发文档 §4.7；缺陷 F03/F04 修复后口径）。
 *
 * D1 记录：A3 拟定统一统计 GET /api/v1/users/me/message-summary 尚未交付，
 * 会话未读（conversationUnread）暂无来源。在会话来源接入前（complete=false），
 * 通知计数不得呈现为完整消息合计：数字角标不显示，仅有通知未读时显示
 * 圆点角标表达「有未读系统通知」；A3 交付后在 refresh() 合并会话来源、
 * 按已读事件刷新，并把 complete 改为按实际来源完整性计算。
 *
 * 并发与生命周期（F04）：refresh 捕获发起时的 generation，reset（退出/换号）
 * 递增 generation 使在途旧请求作废——旧响应到达后直接丢弃，不再回写状态，
 * 其 finally 也不得清除新代次的 inFlight。
 */
export const usePcUnreadStore = defineStore('pcUnread', {
  state: () => ({
    /** 最后一次成功的通知未读数；失败时保留，不伪造 0 */
    total: 0,
    /** 是否至少成功获取过一次 */
    loaded: false,
    /** 最近一次请求是否失败（角标恢复成功后自动纠正） */
    failed: false,
    /** 防重叠：请求进行中跳过新一轮轮询 */
    inFlight: false,
    /** 会话代次：reset 时递增，在途旧请求据此作废 */
    generation: 0
  }),

  getters: {
    /** 会话未读来源未接入前恒为 false：合计不完整，不显示数字角标 */
    complete: () => false,
    /** 完整合计才显示数字（'' 表示 0 不显示）；异常值返回 null 同样不显示 */
    badgeText(state) {
      return this.complete ? unreadBadgeText(state.total) : ''
    },
    /** 部分统计下有通知未读时显示圆点角标，不表达具体数量 */
    showPartialDot(state) {
      return !this.complete && state.total > 0
    }
  },

  actions: {
    /** 静默刷新：失败保留最后成功值，不弹窗、不抛错，由轮询周期恢复 */
    async refresh() {
      if (this.inFlight) {
        return
      }
      const gen = this.generation
      this.inFlight = true
      try {
        const data = await getUnreadCount({ silent: true })
        const total = data?.total
        if (gen !== this.generation) {
          // 已被 reset 作废（退出/换号/重置）：丢弃旧响应，不回写新会话状态
          return
        }
        if (typeof total === 'number' && Number.isInteger(total) && total >= 0) {
          this.total = total
          this.failed = false
          this.loaded = true
        } else {
          this.failed = true
        }
      } catch {
        if (gen !== this.generation) {
          return
        }
        this.failed = true
      } finally {
        if (gen === this.generation) {
          this.inFlight = false
        }
      }
    },

    reset() {
      // 作废在途请求并清空状态；inFlight 一并复位，允许新会话立即轮询
      this.generation += 1
      this.total = 0
      this.loaded = false
      this.failed = false
      this.inFlight = false
    }
  }
})

export default usePcUnreadStore
