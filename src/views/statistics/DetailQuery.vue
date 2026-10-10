<template>
  <div class="detail-query-container">
    <div class="page-header">
      <h2 class="page-title">明细数据查询</h2>
    </div>

    <el-card class="table-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 内容数据：作品明细 -->
        <el-tab-pane label="内容数据" name="content">
          <div class="filter-row">
            <el-input v-model="workQuery.keyword" placeholder="作品标题/作者昵称" clearable style="width: 200px" @keyup.enter="handleWorkQuery" />
            <el-select v-model="workQuery.status" placeholder="审核状态" clearable style="width: 140px">
              <el-option label="草稿" value="draft" />
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已上架" value="on_shelf" />
              <el-option label="已下架" value="off_shelf" />
            </el-select>
            <el-date-picker
              v-model="workDateRange"
              type="daterange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 260px"
            />
            <el-button type="primary" class="black-button" @click="handleWorkQuery">查询</el-button>
            <el-button type="primary" class="black-button" @click="handleExport('works')">数据导出</el-button>
          </div>
          <el-table :data="workList" v-loading="loading" style="width: 100%">
            <el-table-column prop="workId" label="作品ID" width="90" />
            <el-table-column prop="title" label="作品标题" min-width="160" />
            <el-table-column prop="authorName" label="作者" width="120" />
            <el-table-column label="类型" width="100">
              <template #default="{ row }">{{ workTypeLabel(row.workType) }}</template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="浏览量" width="100" align="center">
              <template #default="{ row }">{{ row.viewCount }}</template>
            </el-table-column>
            <el-table-column label="收藏量" width="100" align="center">
              <template #default="{ row }">{{ row.favoriteCount }}</template>
            </el-table-column>
            <el-table-column label="销量" width="90" align="center">
              <template #default="{ row }">{{ row.saleCount }}</template>
            </el-table-column>
            <el-table-column label="价格" width="100" align="center">
              <template #default="{ row }">¥{{ row.price }}</template>
            </el-table-column>
            <el-table-column label="创建时间" width="170">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
          </el-table>
          <div class="pagination-row">
            <el-pagination
              v-model:current-page="workQuery.page"
              v-model:page-size="workQuery.pageSize"
              :total="workTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="fetchWorks"
              @current-change="fetchWorks"
            />
          </div>
        </el-tab-pane>

        <!-- 用户数据：用户明细 -->
        <el-tab-pane label="用户数据" name="user">
          <div class="filter-row">
            <el-input v-model="userQuery.keyword" placeholder="用户名/昵称/手机号" clearable style="width: 200px" @keyup.enter="handleUserQuery" />
            <el-select v-model="userQuery.userType" placeholder="用户类型" clearable style="width: 140px">
              <el-option label="平台用户" value="00" />
              <el-option label="创作者" value="01" />
            </el-select>
            <el-date-picker
              v-model="userDateRange"
              type="daterange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 260px"
            />
            <el-button type="primary" class="black-button" @click="handleUserQuery">查询</el-button>
            <el-button type="primary" class="black-button" @click="handleExport('users')">数据导出</el-button>
          </div>
          <el-table :data="userList" v-loading="loading" style="width: 100%">
            <el-table-column prop="userId" label="用户ID" width="90" />
            <el-table-column prop="userName" label="用户名" width="130" />
            <el-table-column prop="nickName" label="昵称" min-width="130" />
            <el-table-column label="类型" width="110">
              <template #default="{ row }">
                <el-tag :type="row.userType === '01' ? 'success' : 'info'" size="small">
                  {{ row.userType === '01' ? '创作者' : '平台用户' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="phonenumber" label="手机号" width="130" />
            <el-table-column prop="email" label="邮箱" min-width="150" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === '0' ? 'success' : 'danger'" size="small">
                  {{ row.status === '0' ? '正常' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="注册时间" width="170">
              <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
            </el-table-column>
          </el-table>
          <div class="pagination-row">
            <el-pagination
              v-model:current-page="userQuery.page"
              v-model:page-size="userQuery.pageSize"
              :total="userTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="fetchUsers"
              @current-change="fetchUsers"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import adminFetch from '@/utils/adminFetch'

const DETAIL_PREFIX = '/api/v1/admin/statistics/detail'

const activeTab = ref('content')
const loading = ref(false)

// 作品明细
const workQuery = reactive({ keyword: '', status: '', page: 1, pageSize: 10 })
const workTotal = ref(0)
const workList = ref([])
const workDateRange = ref(null)

// 用户明细
const userQuery = reactive({ keyword: '', userType: '', page: 1, pageSize: 10 })
const userTotal = ref(0)
const userList = ref([])
const userDateRange = ref(null)

const workTypeLabel = (t) => ({ NOVEL: '小说', DRAMA: '短剧', SCRIPT: '剧本', COMIC: '漫画' }[t] || t)
const statusLabel = (s) => ({ draft: '草稿', pending: '待审核', approved: '已通过', on_shelf: '已上架', off_shelf: '已下架' }[s] || s)
const statusTag = (s) => ({ draft: 'info', pending: 'warning', approved: 'primary', on_shelf: 'success', off_shelf: 'danger' }[s] || 'info')
const formatDate = (d) => (d ? String(d).replace('T', ' ').slice(0, 19) : '')

const fetchWorks = async () => {
  loading.value = true
  try {
    let url = `${DETAIL_PREFIX}/works?page=${workQuery.page}&pageSize=${workQuery.pageSize}`
    if (workQuery.keyword) url += `&keyword=${encodeURIComponent(workQuery.keyword)}`
    if (workQuery.status) url += `&status=${workQuery.status}`
    if (workDateRange.value) url += `&startDate=${workDateRange.value[0]}&endDate=${workDateRange.value[1]}`
    const res = await adminFetch(url)
    const data = await res.json()
    if (data.code === 200) {
      workList.value = data.rows || []
      workTotal.value = data.total || 0
    }
  } catch (e) {
    ElMessage.error('获取内容明细失败')
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  loading.value = true
  try {
    let url = `${DETAIL_PREFIX}/users?page=${userQuery.page}&pageSize=${userQuery.pageSize}`
    if (userQuery.keyword) url += `&keyword=${encodeURIComponent(userQuery.keyword)}`
    if (userQuery.userType) url += `&userType=${userQuery.userType}`
    if (userDateRange.value) url += `&startDate=${userDateRange.value[0]}&endDate=${userDateRange.value[1]}`
    const res = await adminFetch(url)
    const data = await res.json()
    if (data.code === 200) {
      userList.value = data.rows || []
      userTotal.value = data.total || 0
    }
  } catch (e) {
    ElMessage.error('获取用户明细失败')
  } finally {
    loading.value = false
  }
}

const handleWorkQuery = () => { workQuery.page = 1; fetchWorks() }
const handleUserQuery = () => { userQuery.page = 1; fetchUsers() }
const handleTabChange = (name) => {
  if (name === 'content') fetchWorks()
  else if (name === 'user') fetchUsers()
}

// 数据导出：调用后端接口下载CSV
const handleExport = async (type) => {
  try {
    let url = `${DETAIL_PREFIX}/export?type=${type}`
    if (type === 'works') {
      if (workQuery.keyword) url += `&keyword=${encodeURIComponent(workQuery.keyword)}`
      if (workQuery.status) url += `&status=${workQuery.status}`
      if (workDateRange.value) url += `&startDate=${workDateRange.value[0]}&endDate=${workDateRange.value[1]}`
    } else {
      if (userQuery.keyword) url += `&keyword=${encodeURIComponent(userQuery.keyword)}`
      if (userQuery.userType) url += `&userType=${userQuery.userType}`
      if (userDateRange.value) url += `&startDate=${userDateRange.value[0]}&endDate=${userDateRange.value[1]}`
    }
    const res = await adminFetch(url)
    if (!res.ok) throw new Error('export failed')
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = (type === 'works' ? '作品明细' : '用户明细') + '_' + new Date().toISOString().slice(0, 10) + '.csv'
    a.click()
    URL.revokeObjectURL(a.href)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  fetchWorks()
})
</script>

<style scoped>
.detail-query-container { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-title { margin: 0; font-size: 20px; font-weight: 600; }
.filter-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
.pagination-row { display: flex; justify-content: flex-end; margin-top: 14px; }
</style>
