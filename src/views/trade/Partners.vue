<template>
  <PageContainer>
    <PageHeader title="合作方管理">
      <template #actions>
        <BlackButton @click="handleCreate">新增合作方</BlackButton>
      </template>
    </PageHeader>

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select
          v-model="query.partnerType"
          placeholder="全部合作方类型"
          style="width: 170px"
          clearable
        >
          <el-option
            v-for="opt in partnerTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="query.keyword"
          placeholder="企业名称搜索"
          style="width: 200px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="query.pageNo"
      v-model:pageSize="query.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      @page-change="loadList"
      @size-change="loadList"
    >
      <el-table-column prop="companyName" label="企业名称" min-width="160" />
      <el-table-column prop="partnerTypeLabel" label="合作方类型" width="130" />
      <el-table-column prop="cooperationCount" label="累计合作次数" width="120" />
      <el-table-column label="需求标签" min-width="180">
        <template #default="{ row }">
          <el-tag v-for="tag in row.tags" :key="tag" size="small" class="tag-item">{{ tag }}</el-tag>
          <span v-if="!row.tags || !row.tags.length">-</span>
        </template>
      </el-table-column>
      <el-table-column label="认证状态" width="110">
        <template #default="{ row }">
          <!-- 文档 2.35 未给 certStatus 完整枚举，先展示原值，待后端确认字典后切 StatusTag -->
          {{ row.certStatus }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleFollowUp(row)">商务跟进</el-button>
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </TableCard>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import BlackButton from '@/components/BlackButton.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import { enumOptions } from '@/constants/tradeEnum'
import { getPartnerList } from '@/api/trade'

defineOptions({ name: 'Partners' })

// 合作方类型枚举取自 constants/tradeEnum.js（接口 2.35）
const partnerTypeOptions = enumOptions('partnerType')

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = ref({ pageNo: 1, pageSize: 10, partnerType: '', keyword: '' })

async function loadList() {
  loading.value = true
  try {
    const res = await getPartnerList(query.value)
    list.value = res.rows || []
    total.value = res.total || 0
  } catch {
    list.value = []
    total.value = 0
    ElMessage.error('加载合作方列表失败')
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  query.value.pageNo = 1
  loadList()
}

function handleReset() {
  query.value = { pageNo: 1, pageSize: 10, partnerType: '', keyword: '' }
  loadList()
}

function handleCreate() {
  ElMessage.info('新增合作方')
}

function handleEdit(row) {
  ElMessage.info(`编辑合作方：${row.companyName}`)
}

function handleFollowUp(row) {
  ElMessage.info(`商务跟进：${row.companyName}`)
}

onMounted(loadList)
</script>

<style scoped>
.tag-item {
  margin-right: 6px;
}
</style>
