import { defineStore } from 'pinia'
import { getUnreadCount } from '@/api/pcUser'
import { getChatUnreadCount } from '@/api/chat'
import { userAnnouncements } from '@/api/announcements'
import { unreadSources } from '@/utils/notificationDraft'
import { unreadBadgeText } from '@/utils/pcFormat'

/**
 * 公共消息角标统计（开发文档 §4.7；缺陷 F03/F04 修复后口径）。
 *
 * 未读统计包含三个来源：
 *   - 系统通知未读 GET /api/v1/messages/unread-count -> { total }
 *   - 会话未读     GET /api/v1/users/me/chat/unread-count -> { chatUnread }
 *   - 平台公告未读 GET /api/v1/announcements/unread-count -> { total }
 * refresh() 并发拉取三个来源并求和为合计角标；complete 改为按来源完整性计算：
 * 三个来源都成功才呈现数字合计，任一失败则降级为「仅有未读时显示圆点」，
 * 避免把不完整合计当成完整消息数误导用户。
 *
 * 并发与生命周期（F04）：refresh 捕获发起时的 generation，reset（退出/换号）
 * 递增 generation 使在途旧请求作废——旧响应到达后直接丢弃，不再回写状态，
 * 其 finally 也不得清除新代次的 inFlight。
 */
export const usePcUnreadStore = defineStore('pcUnread', {
  state: () => ({
    /** 最后一次成功的通知未读数；失败时保留，不伪造 0 */
    notifyUnread: 0,
    /** 最后一次成功的会话未读数；失败时保留，不伪造 0 */
    chatUnread: 0,
    announcementUnread: 0,
    /** 合计未读（通知 + 会话 + 公告） */
    total: 0,
    /** 是否至少成功获取过一次（三来源均成功） */
    loaded: false,
    /** 最近一次请求是否有来源失败（角标恢复成功后自动纠正） */
    failed: false,
    /** 防重叠：请求进行中跳过新一轮轮询 */
    inFlight: false,
    /** 会话代次：reset 时递增，在途旧请求据此作废 */
    generation: 0
  }),

  getters: {
    /** 三个来源都成功过且最近一次无失败，合计才完整、才显示数字角标 */
    complete: (state) => state.loaded && !state.failed,
    /** 完整合计才显示数字（'' 表示 0 不显示）；异常值返回 null 同样不显示 */
    badgeText(state) {
      return this.complete ? unreadBadgeText(state.total) : ''
    },
    /** 部分统计下有未读时显示圆点角标，不表达具体数量 */
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
        const results = await Promise.allSettled([
          getUnreadCount({ silent: true }).then(result => result?.total),
          getChatUnreadCount({ silent: true }).then(result => result?.chatUnread),
          userAnnouncements.unreadCount({ silent: true }).then(result => result?.total)
        ])
        if (gen !== this.generation) return
        const aggregate = unreadSources(results, [this.notifyUnread, this.chatUnread, this.announcementUnread])
        ;[this.notifyUnread, this.chatUnread, this.announcementUnread] = aggregate.counts
        this.total = aggregate.total
        this.failed = !aggregate.complete
        if (aggregate.complete) {
          this.loaded = true
        }
      } finally {
        if (gen === this.generation) {
          this.inFlight = false
        }
      }
    },

    reset() {
      // 作废在途请求并清空状态；inFlight 一并复位，允许新会话立即轮询
      this.generation += 1
      this.notifyUnread = 0
      this.chatUnread = 0
      this.announcementUnread = 0
      this.total = 0
      this.loaded = false
      this.failed = false
      this.inFlight = false
    }
  }
})

export default usePcUnreadStore
