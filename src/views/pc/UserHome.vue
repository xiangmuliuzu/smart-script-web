<template>
  <div class="home-page">
    <section class="welcome-panel">
      <div class="welcome-identity">
        <img v-if="avatarUrl" class="welcome-avatar" :src="avatarUrl" alt="用户头像" />
        <div v-else class="welcome-avatar is-placeholder"><el-icon><UserFilled /></el-icon></div>
        <div><p class="eyebrow">PERSONAL WORKSPACE</p><h1>{{ greeting }}，{{ pcUserStore.displayName }}</h1><p>欢迎来到你的个人工作台。</p></div>
      </div>
      <!-- 作品快捷入口与公共菜单同一判断来源：authorCapability（A1 对接点） -->
      <router-link v-if="pcUserStore.authorCapability" class="welcome-action" to="/pc/user/works/all">查看我的作品 <el-icon><ArrowRight /></el-icon></router-link>
    </section>

    <!-- 作品统计（仅创作者展示，A1 工作台首页） -->
    <section v-if="pcUserStore.authorCapability" class="stats-section">
      <div class="section-head">
        <h2>作品概览</h2>
        <el-button link :loading="statsLoading" @click="loadStats">刷新</el-button>
      </div>

      <!-- 加载中 -->
      <div v-if="statsLoading && !stats" class="stats-grid">
        <div v-for="n in 5" :key="n" class="stat-card is-skeleton">
          <el-skeleton animated :rows="1" />
        </div>
      </div>

      <!-- 接口失败 -->
      <el-alert
        v-else-if="statsError"
        type="warning"
        :closable="false"
        show-icon
        title="作品统计加载失败"
      >
        <template #default>
          <span>{{ statsError }}</span>
          <el-button link type="primary" @click="loadStats">重新加载</el-button>
        </template>
      </el-alert>

      <!-- 统计卡片 -->
      <div v-else class="stats-grid">
        <router-link v-for="card in statCards" :key="card.key" class="stat-card" :to="card.to">
          <span class="stat-label">{{ card.label }}</span>
          <strong class="stat-value">{{ card.value }}</strong>
          <span class="stat-hint">{{ card.hint }}</span>
        </router-link>
      </div>

      <p v-if="!statsLoading && !statsError && stats && stats.workTotal === 0" class="stats-empty">
        还没有作品，先去创作第一部剧本吧。
      </p>
    </section>

    <div class="home-grid">
      <router-link v-if="pcUserStore.authorCapability" class="home-card" to="/pc/user/works/all"><el-icon class="card-icon"><Document /></el-icon><h2>我的作品</h2><p>按创作与审核状态查看作品</p><span>进入作品管理 <el-icon><ArrowRight /></el-icon></span></router-link>
      <router-link class="home-card" to="/pc/user/messages"><el-icon class="card-icon"><ChatLineSquare /></el-icon><h2>消息与沟通</h2><p>查看审核、交易与系统消息</p><span>查看消息 <el-icon><ArrowRight /></el-icon></span></router-link>
      <router-link class="home-card" to="/pc/user/profile"><el-icon class="card-icon"><User /></el-icon><h2>个人资料</h2><p>维护昵称、头像与个人简介</p><span>编辑资料 <el-icon><ArrowRight /></el-icon></span></router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowRight, Document, ChatLineSquare, User, UserFilled } from '@element-plus/icons-vue'
import { usePcUserStore } from '@/stores/pcUser'
import { getWorkStatistics } from '@/api/pcWork'
import { resolveMediaUrl } from '@/utils/request'

const pcUserStore = usePcUserStore()
/** 当前用户头像（后端下发相对路径，需补全 baseUrl） */
const avatarUrl = computed(() => resolveMediaUrl(pcUserStore.user?.avatar))
const greeting = computed(() => {
  const hour = new Date().getHours()
  return hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'
})

const stats = ref(null)
const statsLoading = ref(false)
const statsError = ref('')

/** 统计卡片：作品总数 / 草稿 / 审核中 / 待修改 / 已上架（点击进入对应筛选的作品列表） */
const statCards = computed(() => {
  const data = stats.value || {}
  return [
    { key: 'total', label: '作品总数', value: data.workTotal ?? 0, hint: '全部作品', to: '/pc/user/works/all' },
    { key: 'draft', label: '草稿', value: data.draftCount ?? 0, hint: '待完善', to: '/pc/user/works/draft' },
    { key: 'reviewing', label: '审核中', value: data.reviewingCount ?? 0, hint: '平台审核中', to: '/pc/user/works/review' },
    { key: 'revision', label: '待修改', value: data.revisionCount ?? 0, hint: '需按意见修改', to: '/pc/user/works/revision' },
    { key: 'published', label: '已上架', value: data.publishedCount ?? 0, hint: '书城可见', to: '/pc/user/works/listed' }
  ]
})

async function loadStats() {
  statsLoading.value = true
  statsError.value = ''
  try {
    const data = await getWorkStatistics()
    stats.value = data && typeof data === 'object' ? data : null
  } catch (error) {
    statsError.value = error?.message || '网络异常，请稍后重试'
  } finally {
    statsLoading.value = false
  }
}

// 身份确认后（含刷新后 store 重建）再拉取统计，避免无创作者能力时的无谓请求
watch(
  () => pcUserStore.infoLoaded && pcUserStore.authorCapability,
  (ready) => {
    if (ready && !stats.value && !statsLoading.value) {
      loadStats()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.welcome-panel{display:flex;align-items:end;justify-content:space-between;gap:24px;padding:36px 40px;border-radius:10px;color:#fff;background:linear-gradient(120deg,#333941,#1f2329 65%,#14171b)}
.welcome-identity{display:flex;align-items:center;gap:18px}
.welcome-avatar{width:60px;height:60px;border-radius:50%;object-fit:cover;flex:0 0 auto;border:2px solid #ffffff2e}
.welcome-avatar.is-placeholder{display:flex;align-items:center;justify-content:center;background:#ffffff1a;color:#c5c8cd;font-size:26px}
.eyebrow{font-size:11px;letter-spacing:2px;color:#adb2b8;margin-bottom:15px}.welcome-panel h1{font-size:27px;font-weight:600;margin:0 0 10px}.welcome-panel p:last-child{color:#c5c8cd;font-size:14px}
.welcome-action{display:flex;align-items:center;gap:8px;padding:10px 16px;border:1px solid #81858c;border-radius:4px;color:#fff;text-decoration:none;white-space:nowrap}.welcome-action:hover{background:#ffffff1a}

.stats-section{margin-top:22px}.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.section-head h2{font-size:16px;font-weight:600;color:#1f2329}
.stats-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}
.stat-card{display:flex;flex-direction:column;gap:6px;min-height:104px;padding:18px 20px;background:#fff;border:1px solid #e7e9ec;border-radius:8px;text-decoration:none;color:#303133;transition:box-shadow .2s,transform .2s}
.stat-card:hover{box-shadow:0 8px 24px #1f23291a;transform:translateY(-2px)}
.stat-card.is-skeleton{justify-content:center}
.stat-label{font-size:13px;color:#8a8f99}.stat-value{font-size:26px;font-weight:600;color:#1f2329;line-height:1.1}.stat-hint{font-size:12px;color:#b3b7bd;margin-top:auto}
.stats-empty{margin-top:12px;font-size:13px;color:#8a8f99}

.home-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:22px}.home-card{min-height:210px;padding:26px;background:#fff;border:1px solid #e7e9ec;border-radius:8px;text-decoration:none;color:#303133;transition:box-shadow .2s,transform .2s}.home-card:hover{box-shadow:0 8px 24px #1f23291a;transform:translateY(-2px)}.card-icon{font-size:26px;color:#30343c}.home-card h2{font-size:17px;margin:18px 0 6px}.home-card p{color:#8a8f99;font-size:13px}.home-card span{display:flex;align-items:center;gap:6px;margin-top:30px;color:#42464d;font-size:12px}
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:900px){.home-grid{grid-template-columns:1fr}.home-card{min-height:0}.welcome-panel{align-items:start;flex-direction:column;padding:28px}.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
