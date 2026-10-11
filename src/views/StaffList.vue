<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import StaffFormDrawer from '@/components/StaffFormDrawer.vue'
import { useStaffStore } from '@/stores/staff'
import { MODELS } from '@/mock'
import { STAFF_STATUS, THEME_PRIMARY } from '@/mock/constants'
import type { Staff } from '@/types'

const store = useStaffStore()
const keyword = ref('')
const status = ref<string>()
const model = ref<string>()
const drawerOpen = ref(false)
const editing = ref<Staff | null>(null)

const data = computed(() => store.list.filter((s) =>
  (!keyword.value || s.name.includes(keyword.value) || s.role.includes(keyword.value)) &&
  (!status.value || s.status === status.value) && (!model.value || s.model === model.value)))

const columns = [
  { title: '员工', key: 'name', width: 200 },
  { title: '底层模型', dataIndex: 'model', key: 'model' },
  { title: '职位', dataIndex: 'role', key: 'role' },
  { title: '技能', key: 'skills' },
  { title: '状态', key: 'status', width: 100 },
  { title: '入职日期', dataIndex: 'createdAt', key: 'createdAt', sorter: (a: Staff, b: Staff) => a.createdAt.localeCompare(b.createdAt) },
  { title: '操作', key: 'action', width: 140 }
]
const modelColor: Record<string, string> = { 'Grok Build': 'geekblue', 'Gemini 3.1 Pro': 'blue', 'Claude Sonnet 4.6': 'orange', 'GPT-5': 'green', 'DeepSeek V3': 'purple' }

function openCreate() { editing.value = null; drawerOpen.value = true }
function openEdit(r: Staff) { editing.value = r; drawerOpen.value = true }
function onSubmit(v: Omit<Staff, 'id' | 'createdAt' | 'avatar'>) {
  if (editing.value) { store.update(editing.value.id, v); message.success('员工信息已更新') }
  else { store.add(v); message.success('新增员工成功') }
}
function onDelete(r: Staff) { store.remove(r.id); message.success(`已删除员工「${r.name}」`) }
function reset() { keyword.value = ''; status.value = undefined; model.value = undefined }
</script>
<template>
  <a-card :bordered="false">
    <div class="toolbar">
      <a-space wrap>
        <a-input v-model:value="keyword" placeholder="搜索名称 / 职位" allow-clear style="width: 220px"><template #prefix><SearchOutlined /></template></a-input>
        <a-select v-model:value="status" placeholder="全部状态" allow-clear style="width: 130px"
          :options="Object.entries(STAFF_STATUS).map(([k, v]) => ({ value: k, label: v.text }))" />
        <a-select v-model:value="model" placeholder="全部模型" allow-clear style="width: 170px" :options="MODELS.map((m) => ({ value: m, label: m }))" />
        <a-button @click="reset">重置</a-button>
      </a-space>
      <a-button type="primary" @click="openCreate"><PlusOutlined />新增员工</a-button>
    </div>
    <a-table :columns="columns" :data-source="data" row-key="id" :pagination="{ pageSize: 8, showTotal: (t: number) => `共 ${t} 名员工` }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <router-link class="name-link" :to="`/staff/${record.id}`">
            <a-avatar :src="record.avatar" style="background: #f0f0ff" />
            <span class="name">{{ record.name }}</span>
          </router-link>
        </template>
        <template v-else-if="column.key === 'model'"><a-tag :color="modelColor[record.model]">{{ record.model }}</a-tag></template>
        <template v-else-if="column.key === 'skills'"><a-tag v-for="s in record.skills" :key="s">{{ s }}</a-tag></template>
        <template v-else-if="column.key === 'status'">
          <a-badge :status="STAFF_STATUS[record.status as Staff['status']].color" :text="STAFF_STATUS[record.status as Staff['status']].text" />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a @click="openEdit(record as Staff)">编辑</a>
            <a-popconfirm title="确定删除该员工吗？" ok-text="删除" cancel-text="取消" @confirm="onDelete(record as Staff)">
              <a style="color: #ff4d4f">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
    <StaffFormDrawer v-model:open="drawerOpen" :record="editing" @submit="onSubmit" />
  </a-card>
</template>
<style scoped>
.toolbar { display: flex; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
.name-link { display: inline-flex; align-items: center; gap: 8px; color: v-bind(THEME_PRIMARY); text-decoration: none; }
.name-link:hover { text-decoration: underline; }
.name { font-weight: 600; }
</style>
