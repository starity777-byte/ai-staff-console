<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import TaskFormModal from '@/components/TaskFormModal.vue'
import { useTaskStore } from '@/stores/task'
import { useStaffStore } from '@/stores/staff'
import { TASK_STATUS, PRIORITY, THEME_PRIMARY } from '@/mock/constants'
import type { Task } from '@/types'

const task = useTaskStore()
const staff = useStaffStore()
const filter = ref<'all' | Task['status']>('all')
const modalOpen = ref(false)
const data = computed(() => task.list.filter((t) => filter.value === 'all' || t.status === filter.value))
const tabs = computed(() => [
  { label: `全部（${task.list.length}）`, value: 'all' },
  ...(Object.keys(TASK_STATUS) as Task['status'][]).map((k) => ({ label: `${TASK_STATUS[k].text}（${task.list.filter((t) => t.status === k).length}）`, value: k }))
])
const columns = [
  { title: '任务名称', dataIndex: 'title', key: 'title' },
  { title: '负责人', key: 'assignee', width: 220 },
  { title: '优先级', key: 'priority', width: 90 },
  { title: '进度', key: 'progress', width: 220 },
  { title: '状态', key: 'status', width: 100 },
  { title: '截止日期', dataIndex: 'deadline', key: 'deadline', width: 120 },
  { title: '操作', key: 'action', width: 80 }
]
function onCreate(v: Omit<Task, 'id'>) { task.add(v); message.success('任务创建成功') }
function onDelete(t: Task) { task.remove(t.id); message.success('任务已删除') }
</script>
<template>
  <a-card :bordered="false">
    <div class="toolbar">
      <a-segmented v-model:value="filter" :options="tabs" />
      <a-button type="primary" @click="modalOpen = true"><PlusOutlined />新建任务</a-button>
    </div>
    <a-table :columns="columns" :data-source="data" row-key="id" :pagination="{ pageSize: 8 }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'assignee'">
          <a-space v-if="staff.getById(record.assigneeId)">
            <a-avatar size="small" :src="staff.getById(record.assigneeId)!.avatar" />
            {{ staff.getById(record.assigneeId)!.name }}
            <span class="sub">{{ staff.getById(record.assigneeId)!.model }}</span>
          </a-space>
          <span v-else class="sub">（已离职）</span>
        </template>
        <template v-else-if="column.key === 'priority'"><a-tag :color="PRIORITY[record.priority as Task['priority']].color">{{ PRIORITY[record.priority as Task['priority']].text }}</a-tag></template>
        <template v-else-if="column.key === 'progress'">
          <a-progress :stroke-color="THEME_PRIMARY" :percent="record.progress" size="small" :status="record.status === 'done' ? 'success' : record.status === 'doing' ? 'active' : 'normal'" />
        </template>
        <template v-else-if="column.key === 'status'"><a-tag :color="TASK_STATUS[record.status as Task['status']].color">{{ TASK_STATUS[record.status as Task['status']].text }}</a-tag></template>
        <template v-else-if="column.key === 'action'">
          <a-popconfirm title="确定删除该任务？" ok-text="删除" cancel-text="取消" @confirm="onDelete(record as Task)"><a style="color: #ff4d4f">删除</a></a-popconfirm>
        </template>
      </template>
    </a-table>
    <TaskFormModal v-model:open="modalOpen" @submit="onCreate" />
  </a-card>
</template>
<style scoped>
.toolbar { display: flex; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.sub { color: #8c8c8c; font-size: 12px; }
</style>
