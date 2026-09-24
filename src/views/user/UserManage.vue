<template>
  <div class="user-manage-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">用户与创作者管理</h2>
      <!-- 契约未定义添加/导出接口，故不显示对应按钮，避免出现无效入口 -->
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item>
          <el-select v-model="filterForm.roleCode" placeholder="全部角色" style="width: 140px" clearable>
            <el-option label="全部角色" value="" />
            <el-option v-for="r in grantableRoles" :key="r.roleId" :label="r.roleName" :value="r.roleKey" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px" clearable>
            <el-option label="全部状态" value="" />
            <el-option label="正常" value="0" />
            <el-option label="停用" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filterForm.realNameStatus" placeholder="全部实名状态" style="width: 150px" clearable>
            <el-option label="全部实名状态" value="" />
            <el-option label="待审核" value="PENDING" />
            <el-option label="已通过" value="APPROVED" />
            <el-option label="已驳回" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="filterForm.keyword"
            placeholder="昵称/账号/手机号"
            style="width: 200px"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="black-button" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表：真实接口 -->
    <el-card class="table-card">
      <el-table :data="userList" style="width: 100%" v-loading="loading">
        <el-table-column prop="userId" label="ID" width="90" />
        <el-table-column prop="nickname" label="昵称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="phoneMasked" label="手机号" width="130">
          <template #default="{ row }">{{ row.phoneMasked || '—' }}</template>
        </el-table-column>
        <el-table-column label="账号类型" width="110">
          <template #default="{ row }">
            <el-tag size="small">{{ userTypeLabel(row.userType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="角色" min-width="150">
          <template #default="{ row }">
            <span v-if="row.roleCodes && row.roleCodes.length">{{ row.roleCodes.join('、') }}</span>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="实名" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.realNameStatus" :type="realNameTagType(row.realNameStatus)" size="small">
              {{ realNameLabel(row.realNameStatus) }}
            </el-tag>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="作者能力" width="100">
          <template #default="{ row }">
            <el-tag :type="row.authorCapability ? 'success' : 'info'" size="small">
              {{ row.authorCapability ? '已开通' : '未开通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'" size="small">
              {{ row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-permission="['user:app:query']"
                size="small"
                @click="handleDetail(row)"
              >详情</el-button>
              <el-button
                v-permission="['user:app:grant']"
                size="small"
                @click="openRoleDialog(row)"
              >授权</el-button>
              <el-button
                v-permission="['user:app:status']"
                :type="row.status === '0' ? 'danger' : 'success'"
                size="small"
                :loading="statusBusyId === row.userId"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === '0' ? '停用' : '启用' }}
              </el-button>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <div class="empty-state">
            <span v-if="errorText">{{ errorText }}</span>
            <span v-else>暂无数据</span>
            <el-button v-if="errorText" size="small" type="primary" link @click="loadUsers">重试</el-button>
          </div>
        </template>
      </el-table>
      <div class="pager-wrap">
        <el-pagination
          layout="total, prev, pager, next"
          :total="total"
          :page-size="query.pageSize"
          :current-page="query.pageNum"
          @current-change="onPageChange"
        />
      </div>
    </el-card>

    <!-- 创作者资质与权限配置：真实接口 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">创作者资质与权限配置</span>
        </div>
      </template>
      <el-table :data="creatorList" style="width: 100%" v-loading="creatorLoading">
        <el-table-column prop="userId" label="ID" width="90" />
        <el-table-column prop="nickname" label="创作者" min-width="150" show-overflow-tooltip />
        <el-table-column prop="phoneMasked" label="手机号" width="130">
          <template #default="{ row }">{{ row.phoneMasked || '—' }}</template>
        </el-table-column>
        <el-table-column label="作者能力" width="110">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
              {{ row.enabled ? '已开通' : '未开通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="变更原因" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">{{ row.reason || '—' }}</template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人" width="120">
          <template #default="{ row }">{{ row.operatorName || '—' }}</template>
        </el-table-column>
        <el-table-column label="更新时间" width="170">
          <template #default="{ row }">{{ formatTime(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="['user:creator:update']"
              size="small"
              :loading="creatorBusyId === row.userId"
              @click="openCapabilityDialog(row)"
            >
              {{ row.enabled ? '关闭' : '开通' }}
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="empty-state">
            <span v-if="creatorError">{{ creatorError }}</span>
            <span v-else>暂无数据</span>
            <el-button v-if="creatorError" size="small" type="primary" link @click="loadCreators">重试</el-button>
          </div>
        </template>
      </el-table>
      <div class="pager-wrap">
        <el-pagination
          layout="total, prev, pager, next"
          :total="creatorTotal"
          :page-size="creatorQuery.pageSize"
          :current-page="creatorQuery.pageNum"
          @current-change="onCreatorPageChange"
        />
      </div>
    </el-card>

    <!-- 用户详情 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="560px">
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="用户 ID">{{ detail.userId }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ detail.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detail.phoneMasked || '—' }}</el-descriptions-item>
        <el-descriptions-item label="账号类型">{{ userTypeLabel(detail.userType) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          {{ detail.status === '0' ? '正常' : '停用' }}
        </el-descriptions-item>
        <el-descriptions-item label="角色">
          {{ (detail.roleCodes && detail.roleCodes.length) ? detail.roleCodes.join('、') : '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="实名状态">
          {{ detail.realNameStatus ? realNameLabel(detail.realNameStatus) : '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="作者能力">
          {{ detail.authorCapability ? '已开通' : '未开通' }}
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatTime(detail.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="最近登录">{{ formatTime(detail.lastLoginTime) }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 角色授权 -->
    <el-dialog v-model="roleDialogVisible" title="角色授权" width="480px">
      <el-form label-width="80px">
        <el-form-item label="用户">
          {{ roleTarget ? `${roleTarget.nickname}（ID ${roleTarget.userId}）` : '' }}
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="roleForm.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="r in grantableRoles"
              :key="r.roleId"
              :label="r.roleName"
              :value="r.roleId"
            />
          </el-select>
          <div class="form-hint">仅可选择标记为可授予 App 用户的角色</div>
        </el-form-item>
        <el-form-item label="原因" required>
          <el-input v-model="roleForm.reason" type="textarea" :rows="2" placeholder="必填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitRoles">确定</el-button>
      </template>
    </el-dialog>

    <!-- 作者能力变更 -->
    <el-dialog v-model="capabilityDialogVisible" title="作者能力变更" width="480px">
      <el-form label-width="80px">
        <el-form-item label="用户">
          {{ capabilityTarget ? `${capabilityTarget.nickname}（ID ${capabilityTarget.userId}）` : '' }}
        </el-form-item>
        <el-form-item label="操作">
          {{ capabilityForm.enabled ? '开通作者能力' : '关闭作者能力' }}
        </el-form-item>
        <el-form-item label="原因" required>
          <el-input v-model="capabilityForm.reason" type="textarea" :rows="2" placeholder="必填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="capabilityDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitCapability">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listAppUsers,
  getAppUser,
  listGrantableRoles,
  changeAppUserStatus,
  grantAppUserRoles
} from '@/api/user/appUser'
import { listAuthorCapabilities, updateAuthorCapability } from '@/api/user/author'

/* ---------------- 用户列表 ---------------- */
const loading = ref(false)
const saving = ref(false)
const userList = ref([])
const total = ref(0)
const errorText = ref('')
const statusBusyId = ref(null)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  realNameStatus: '',
  roleCode: ''
})
const filterForm = reactive({
  keyword: '',
  status: '',
  realNameStatus: '',
  roleCode: ''
})

/* ---------------- 可授权角色 ---------------- */
const grantableRoles = ref([])

/* ---------------- 创作者能力 ---------------- */
const creatorLoading = ref(false)
const creatorList = ref([])
const creatorTotal = ref(0)
const creatorError = ref('')
const creatorBusyId = ref(null)
const creatorQuery = reactive({ pageNum: 1, pageSize: 10, keyword: '', enabled: '' })

/* ---------------- 弹窗状态 ---------------- */
const detailVisible = ref(false)
const detail = ref(null)
const roleDialogVisible = ref(false)
const roleTarget = ref(null)
const roleForm = reactive({ roleIds: [], reason: '' })
const capabilityDialogVisible = ref(false)
const capabilityTarget = ref(null)
const capabilityForm = reactive({ enabled: true, reason: '' })

function userTypeLabel(type) {
  if (type === '01') return '普通用户'
  if (type === '02') return '创作者'
  if (type === '03') return '甲方'
  return type || '—'
}

function realNameLabel(status) {
  if (status === 'PENDING') return '待审核'
  if (status === 'APPROVED') return '已通过'
  if (status === 'REJECTED') return '已驳回'
  return status || '—'
}

function realNameTagType(status) {
  if (status === 'APPROVED') return 'success'
  if (status === 'REJECTED') return 'danger'
  return 'warning'
}

function formatTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function loadUsers() {
  loading.value = true
  errorText.value = ''
  try {
    const res = await listAppUsers({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      keyword: query.keyword || undefined,
      status: query.status || undefined,
      realNameStatus: query.realNameStatus || undefined,
      roleCode: query.roleCode || undefined
    })
    userList.value = res?.rows || []
    total.value = Number(res?.total || 0)
  } catch (e) {
    userList.value = []
    total.value = 0
    errorText.value = e?.message || '加载失败，请重试'
  } finally {
    loading.value = false
  }
}

async function loadGrantableRoles() {
  try {
    const res = await listGrantableRoles()
    grantableRoles.value = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
  } catch {
    // 无授权权限时静默降级：角色筛选与授权下拉为空，不阻断页面
    grantableRoles.value = []
  }
}

async function loadCreators() {
  creatorLoading.value = true
  creatorError.value = ''
  try {
    const res = await listAuthorCapabilities({
      pageNum: creatorQuery.pageNum,
      pageSize: creatorQuery.pageSize,
      keyword: creatorQuery.keyword || undefined,
      enabled: creatorQuery.enabled === '' ? undefined : creatorQuery.enabled
    })
    creatorList.value = res?.rows || []
    creatorTotal.value = Number(res?.total || 0)
  } catch (e) {
    creatorList.value = []
    creatorTotal.value = 0
    creatorError.value = e?.message || '加载失败，请重试'
  } finally {
    creatorLoading.value = false
  }
}

function handleSearch() {
  query.keyword = filterForm.keyword
  query.status = filterForm.status
  query.realNameStatus = filterForm.realNameStatus
  query.roleCode = filterForm.roleCode
  query.pageNum = 1
  loadUsers()
}

function handleReset() {
  filterForm.keyword = ''
  filterForm.status = ''
  filterForm.realNameStatus = ''
  filterForm.roleCode = ''
  handleSearch()
}

function onPageChange(page) {
  query.pageNum = page
  loadUsers()
}

function onCreatorPageChange(page) {
  creatorQuery.pageNum = page
  loadCreators()
}

async function handleDetail(row) {
  try {
    const res = await getAppUser(row.userId)
    detail.value = res?.data || res
    detailVisible.value = true
  } catch (e) {
    ElMessage.error(e?.message || '详情加载失败')
  }
}

async function handleToggleStatus(row) {
  const action = row.status === '0' ? '停用' : '启用'
  let reason = ''
  try {
    const { value } = await ElMessageBox.prompt(
      `${action}后该用户的全部 App 会话将立即失效，请填写原因。`,
      `确认${action}`,
      { confirmButtonText: '确定', cancelButtonText: '取消', inputPlaceholder: '必填', type: 'warning' }
    )
    reason = (value || '').trim()
  } catch {
    return
  }
  if (!reason) {
    ElMessage.warning('原因必填')
    return
  }
  statusBusyId.value = row.userId
  try {
    const res = await changeAppUserStatus(row.userId, {
      status: row.status === '0' ? '1' : '0',
      reason
    })
    const changed = res?.data?.changed
    ElMessage.success(changed === false ? `状态已为${action}状态，无重复变更` : `已${action}用户`)
    await loadUsers()
  } catch (e) {
    ElMessage.error(e?.message || `${action}失败`)
  } finally {
    statusBusyId.value = null
  }
}

function openRoleDialog(row) {
  roleTarget.value = row
  roleForm.roleIds = []
  roleForm.reason = ''
  roleDialogVisible.value = true
}

async function submitRoles() {
  if (!roleForm.reason.trim()) {
    ElMessage.warning('原因必填')
    return
  }
  if (!roleForm.roleIds.length) {
    ElMessage.warning('请至少选择一个角色')
    return
  }
  saving.value = true
  try {
    const res = await grantAppUserRoles(roleTarget.value.userId, {
      roleIds: roleForm.roleIds,
      reason: roleForm.reason.trim()
    })
    const changed = res?.data?.changed
    ElMessage.success(changed === false ? '角色未变化，无重复变更' : '角色授权成功')
    roleDialogVisible.value = false
    await loadUsers()
  } catch (e) {
    ElMessage.error(e?.message || '授权失败')
  } finally {
    saving.value = false
  }
}

function openCapabilityDialog(row) {
  capabilityTarget.value = row
  capabilityForm.enabled = !row.enabled
  capabilityForm.reason = ''
  capabilityDialogVisible.value = true
}

async function submitCapability() {
  if (!capabilityForm.reason.trim()) {
    ElMessage.warning('原因必填')
    return
  }
  saving.value = true
  try {
    const res = await updateAuthorCapability(capabilityTarget.value.userId, {
      enabled: capabilityForm.enabled,
      reason: capabilityForm.reason.trim()
    })
    const changed = res?.data?.changed
    ElMessage.success(changed === false ? '状态未变化，无重复变更' : '作者能力已更新')
    capabilityDialogVisible.value = false
    await Promise.all([loadCreators(), loadUsers()])
  } catch (e) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadUsers()
  loadCreators()
  loadGrantableRoles()
})
</script>

<style scoped>
.user-manage-container {
  padding: 20px;
  background-color: #f7f8fa;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2329;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

.filter-form {
  margin: 0;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 12px;
}

.filter-form :deep(.el-form-item:last-child) {
  margin-right: 0;
}

/* 表格卡片 */
.table-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.table-card :deep(.el-card__header) {
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 14px;
  color: #1f2329;
  font-weight: 600;
}

/* 操作按钮容器 */
.action-buttons {
  display: flex;
  gap: 8px;
}

/* 分页 */
.pager-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 14px 24px;
  border-top: 1px solid #f0f0f0;
}

/* 空/错误状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 0;
  color: #8c8c8c;
  font-size: 13px;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

/* 黑色主按钮 */
.black-button {
  background-color: #1f2329;
  border-color: #1f2329;
  color: #ffffff;
}

.black-button:hover {
  background-color: #000000;
  border-color: #000000;
}

.black-button:active {
  background-color: #000000;
  border-color: #000000;
}

/* 表格样式统一 */
:deep(.el-table) {
  font-size: 13px;
  color: #262626;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #595959;
  font-weight: 500;
  font-size: 12px;
}

:deep(.el-table td) {
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

:deep(.el-table tr:hover > td) {
  background-color: #fafafa !important;
}

/* 按钮样式统一 */
:deep(.el-button) {
  font-size: 12px;
  border-radius: 4px;
  padding: 5px 12px;
}

:deep(.el-button--default) {
  color: #595959;
  border-color: #d9d9d9;
  background: #ffffff;
}

:deep(.el-button--default:hover) {
  color: #1f2329;
  border-color: #1f2329;
}

:deep(.el-button--danger) {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  color: #ffffff;
}

:deep(.el-button--danger:hover) {
  background-color: #ff7875;
  border-color: #ff7875;
}

:deep(.el-button--success) {
  background-color: #52c41a;
  border-color: #52c41a;
  color: #ffffff;
}

:deep(.el-button--success:hover) {
  background-color: #73d13d;
  border-color: #73d13d;
}

/* 标签样式 */
:deep(.el-tag) {
  border: none;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 10px;
}

:deep(.el-tag.el-tag--success) {
  background-color: #f6ffed;
  color: #389e0d;
}

:deep(.el-tag.el-tag--danger) {
  background-color: #fff1f0;
  color: #cf1322;
}

:deep(.el-tag.el-tag--warning) {
  background-color: #fff7e6;
  color: #d48806;
}

:deep(.el-tag.el-tag--info) {
  background-color: #fafafa;
  color: #8c8c8c;
}

:deep(.el-tag:not(.el-tag--success):not(.el-tag--danger):not(.el-tag--warning):not(.el-tag--info)) {
  background-color: #f5f5f5;
  color: #8c8c8c;
}

/* 表单控件样式 */
:deep(.el-select .el-input__wrapper) {
  border-radius: 4px;
  border-color: #d9d9d9;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
  border-color: #d9d9d9;
}

:deep(.el-input__inner) {
  font-size: 12px;
  color: #262626;
}

:deep(.el-input__inner::placeholder) {
  color: #bfbfbf;
}
</style>
