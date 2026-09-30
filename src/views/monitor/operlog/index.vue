<template>
  <div class="page">
    <el-card>
      <div class="toolbar">
        <el-form inline>
          <el-form-item label="操作人">
            <el-input v-model="query.operName" clearable style="width:140px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="load">搜索</el-button>
            <el-button v-permission="['monitor:operlog:remove']" type="danger" @click="onClean">清空</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="rows" border v-loading="loading">
        <el-table-column prop="operId" label="ID" width="80" />
        <el-table-column prop="title" label="操作" min-width="120" />
        <el-table-column prop="operName" label="操作人" width="110" />
        <el-table-column prop="operIp" label="IP" width="130" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">{{ row.status === 0 || row.status === '0' ? '成功' : '失败' }}</template>
        </el-table-column>
        <el-table-column prop="operTime" label="时间" width="170" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button v-permission="['monitor:operlog:remove']" size="small" type="danger" @click="onRemove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pager"
        layout="total, prev, pager, next"
        :total="total"
        :page-size="query.pageSize || 10"
        :current-page="query.pageNum || 1"
        @current-change="onPage"
      />
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listOperlog, delOperlog, cleanOperlog } from '@/api/monitor/operlog'

const loading = ref(false)
const rows = ref([])
const total = ref(0)
const query = reactive({ pageNum: 1, pageSize: 10, operName: '' })

async function load() {
  loading.value = true
  try {
    const res = await listOperlog({ ...query })
    rows.value = res?.rows || []
    total.value = Number(res?.total || 0)
  } finally {
    loading.value = false
  }
}
function onPage(p) { query.pageNum = p; load() }
async function onRemove(row) {
  await ElMessageBox.confirm('确认删除该操作日志？', '提示', { type: 'warning' })
  await delOperlog(row.operId)
  ElMessage.success('已删除')
  load()
}
async function onClean() {
  await ElMessageBox.confirm('确认清空全部操作日志？', '提示', { type: 'warning' })
  await cleanOperlog()
  ElMessage.success('已清空')
  load()
}
onMounted(load)
</script>

<style scoped>
.page { padding: 16px; }
.toolbar { margin-bottom: 8px; }
.pager { margin-top: 12px; display: flex; justify-content: flex-end; }
</style>
