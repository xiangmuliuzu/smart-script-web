<template>
  <div class="home-page">
    <section class="welcome-panel">
      <div><p class="eyebrow">PERSONAL WORKSPACE</p><h1>{{ greeting }}，{{ pcUserStore.displayName }}</h1><p>欢迎来到你的个人工作台。</p></div>
      <router-link class="welcome-action" to="/pc/user/works/all">查看我的作品 <el-icon><ArrowRight /></el-icon></router-link>
    </section>
    <div class="home-grid">
      <router-link class="home-card" to="/pc/user/works/all"><el-icon class="card-icon"><Document /></el-icon><h2>我的作品</h2><p>按创作与审核状态查看作品</p><span>进入作品管理 <el-icon><ArrowRight /></el-icon></span></router-link>
      <router-link class="home-card" to="/pc/user/messages"><el-icon class="card-icon"><ChatLineSquare /></el-icon><h2>消息与沟通</h2><p>查看审核、交易与系统消息</p><span>查看消息 <el-icon><ArrowRight /></el-icon></span></router-link>
      <router-link class="home-card" to="/pc/user/profile"><el-icon class="card-icon"><User /></el-icon><h2>个人资料</h2><p>维护昵称、头像与个人简介</p><span>编辑资料 <el-icon><ArrowRight /></el-icon></span></router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRight, Document, ChatLineSquare, User } from '@element-plus/icons-vue'
import { usePcUserStore } from '@/stores/pcUser'

const pcUserStore = usePcUserStore()
const greeting = computed(() => {
  const hour = new Date().getHours()
  return hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'
})
</script>

<style scoped>
.welcome-panel{display:flex;align-items:end;justify-content:space-between;gap:24px;padding:36px 40px;border-radius:10px;color:#fff;background:linear-gradient(120deg,#333941,#1f2329 65%,#14171b)}
.eyebrow{font-size:11px;letter-spacing:2px;color:#adb2b8;margin-bottom:15px}.welcome-panel h1{font-size:27px;font-weight:600;margin:0 0 10px}.welcome-panel p:last-child{color:#c5c8cd;font-size:14px}
.welcome-action{display:flex;align-items:center;gap:8px;padding:10px 16px;border:1px solid #81858c;border-radius:4px;color:#fff;text-decoration:none;white-space:nowrap}.welcome-action:hover{background:#ffffff1a}
.home-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:22px}.home-card{min-height:210px;padding:26px;background:#fff;border:1px solid #e7e9ec;border-radius:8px;text-decoration:none;color:#303133;transition:box-shadow .2s,transform .2s}.home-card:hover{box-shadow:0 8px 24px #1f23291a;transform:translateY(-2px)}.card-icon{font-size:26px;color:#30343c}.home-card h2{font-size:17px;margin:18px 0 6px}.home-card p{color:#8a8f99;font-size:13px}.home-card span{display:flex;align-items:center;gap:6px;margin-top:30px;color:#42464d;font-size:12px}
@media(max-width:900px){.home-grid{grid-template-columns:1fr}.home-card{min-height:0}.welcome-panel{align-items:start;flex-direction:column;padding:28px}}
</style>
