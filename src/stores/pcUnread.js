import { defineStore } from 'pinia'
import { getUnreadCount } from '@/api/pcUser'
import { getChatUnreadCount } from '@/api/chat'
import { unreadBadgeText } from '@/utils/pcFormat'

/**
 * 公共消息角标统计（开发文档 §4.7；缺陷 F03/F04 修复后口径）。
 *
 * A3 已交付：refresh() 同时拉取通知未读 + 会话未读，complete=true，
 * 角标显示两者之和。
 *
 * 并发与生命周期（F04）：refresh 捕获发起时的 generation，reset（退出/换号）
 * 递增 generation 使在途旧请求作废——旧响应到达后直接丢弃，不再回写状态，
 * 其 finally 也不得清除新代次的 inFlight。
 */
export const usePcUnreadStore = defineStore('pcUnread', {
  state: () => ({
    /** 最后一次成功的通知未读数 */
    total: 0,
    /** 最后一次成功的会话未读数 */
    chatUnread: 0,
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
    /** A3 已交付，两个来源均有效 */
    complete: () => true,
    /** 完整合计才显示数字（'' 表示 0 不显示）；通知 + 会话未读之和 */
    badgeText(state) {
      return this.complete ? unreadBadgeText(state.total + state.chatUnread) : ''
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
        const [data, chatData] = await Promise.all([
          getUnreadCount({ silent: true }),
          getChatUnreadCount().catch(() => ({ chatUnread: 0 }))
        ])
        const notifyTotal = data?.total
        const chatTotal = chatData?.chatUnread ?? 0
        if (gen !== this.generation) {
          return
        }
        if (typeof notifyTotal === 'number' && Number.isInteger(notifyTotal) && notifyTotal >= 0) {
          this.total = notifyTotal
          this.chatUnread = chatTotal
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
      this.chatUnread = 0
      this.loaded = false
      this.failed = false
      this.inFlight = false
    }
  }
})

export default usePcUnreadStore
