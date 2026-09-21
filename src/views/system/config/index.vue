<template>
  <div class="page">
    <el-card>
      <div class="toolbar">
        <el-button v-permission="['system:config:add']" type="success" @click="openForm()">新增参数</el-button>
      </div>
      <el-table :data="rows" border v-loading="loading">
        <el-table-column prop="configId" label="ID" width="80" />
        <el-table-column prop="configName" label="名称" min-width="140" />
        <el-table-column prop="configKey" label="键名" min-width="140" />
        <el-table-column prop="configValue" label="键值" min-width="140" />
        <el-table-column prop="configType" label="类型" width="90" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button v-permission="['system:config:edit']" size="small" @click="openForm(row)">编辑</el-button>
            <el-button v-permission="['system:config:remove']" size="small" type="danger" @click="onRemove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialog" :title="form.configId ? '编辑参数' : '新增参数'" width="480px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="名称"><el-input v-model="form.configName" /></el-form-item>
        <el-form-item label="键名"><el-input v-model="form.configKey" /></el-form-item>
        <el-form-item label="键值"><el-input v-model="form.configValue" /></el-form-item>
        <el-form-item label="类型"><el-input v-model="form.configType" placeholder="Y/N" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog=false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listConfig, addConfig, updateConfig, delConfig } from '@/api/system/config'

const loading = ref(false)
const rows = ref([])
const dialog = ref(false)
const form = reactive({ configId: null, configName: '', configKey: '', configValue: '', configType: 'Y' })

async function load() {
  loading.value = true
  try {
    const res = await listConfig({ pageNum: 1, pageSize: 50 })
    rows.value = res?.rows || []
  } finally {
    loading.value = false
  }
}
function openForm(row) {
  Object.assign(form, { configId: null, configName: '', configKey: '', configValue: '', configType: 'Y' })
  if (row) Object.assign(form, { configId: row.configId, configName: row.configName, configKey: row.configKey, configValue: row.configValue, configType: row.configType })
  dialog.value = true
}
async function save() {
  if (form.configId) await updateConfig({ ...form })
  else await addConfig({ ...form })
  ElMessage.success('保存成功')
  dialog.value = false
  load()
}
async function onRemove(row) {
  await ElMessageBox.confirm(`确认删除参数 ${row.configKey}？`, '提示', { type: 'warning' })
  await delConfig(row.configId)
  ElMessage.success('已删除')
  load()
}
onMounted(load)
</script>

<style scoped>
.page { padding: 16px; }
.toolbar { margin-bottom: 12px; }
</style>
