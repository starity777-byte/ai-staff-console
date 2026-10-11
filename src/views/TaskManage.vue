<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, CalendarOutlined } from '@ant-design/icons-vue'
import draggable from 'vuedraggable'
import TaskFormModal from '@/components/TaskFormModal.vue'
import { useTaskStore } from '@/stores/task'
import { useStaffStore } from '@/stores/staff'
import { TASK_STATUS, PRIORITY, THEME_PRIMARY } from '@/mock/constants'
import type { Task } from '@/types'

const VIEW_KEY = 'task-view-mode'

const task = useTaskStore()
const staff = useStaffStore()
const filter = ref<'all' | Task['status']>('all')
const modalOpen = ref(false)
const editing = ref<Task | null>(null)
const savedView = localStorage.getItem(VIEW_KEY)
const viewMode = ref<'table' | 'board'>(savedView === 'board' ? 'board' : 'table')
watch(viewMode, (v) => localStorage.setItem(VIEW_KEY, v))

const data = computed(() => task.list.filter((t) => {
  const status = t.status
  return filter.value === 'all' || status === filter.value
}))
const tabs = computed(() => [
  { label: `全部（${task.list.length}）`, value: 'all' },
  ...(Object.keys(TASK_STATUS) as Task['status'][]).map((k) => ({ label: `${TASK_STATUS[k].text}（${task.list.filter((t) => t.status === k).length}）`, value: k }))
])
const viewOptions = [
  { label: '表格', value: 'table' },
  { label: '看板', value: 'board' }
]
const statusOrder = Object.keys(TASK_STATUS) as Task['status'][]
const columnAccent: Record<Task['status'], string> = {
  todo: '#8c8c8c',
  doing: THEME_PRIMARY,
  done: '#52c41a'
}
const columnLists = reactive<Record<Task['status'], Task[]>>({ todo: [], doing: [], done: [] })

function syncColumns() {
  for (const status of statusOrder) columnLists[status] = data.value.filter((t) => t.status === status)
}
watch(data, syncColumns, { immediate: true })

const columns = [
  { title: '任务名称', dataIndex: 'title', key: 'title' },
  { title: '负责人', key: 'assignee', width: 220 },
  { title: '优先级', key: 'priority', width: 90 },
  { title: '进度', key: 'progress', width: 220 },
  { title: '状态', key: 'status', width: 100 },
  { title: '截止日期', dataIndex: 'deadline', key: 'deadline', width: 120 },
  { title: '操作', key: 'action', width: 80 }
]

let draggingCard = false
function onDragStart() { draggingCard = true }
function onDragEnd() { setTimeout(() => { draggingCard = false }, 0) }
function onColumnChange(status: Task['status'], evt: { added?: { element: Task } }) {
  const element = evt.added?.element
  if (!element || element.status === status) return
  task.updateStatus(element.id, status)
}
function openCreate() { editing.value = null; modalOpen.value = true }
function openEdit(record: Task) {
  if (draggingCard) return
  editing.value = record
  modalOpen.value = true
}
function onSubmit(v: Omit<Task, 'id'>) {
  if (editing.value) { task.update(editing.value.id, v); message.success('任务已更新') }
  else { task.add(v); message.success('任务创建成功') }
}
function onDelete(t: Task) { task.remove(t.id); message.success('任务已删除') }
</script>
<template>
  <a-card :bordered="false">
    <div class="toolbar">
      <a-segmented v-model:value="filter" :options="tabs" />
      <div class="toolbar-right">
        <a-segmented v-model:value="viewMode" :options="viewOptions" />
        <a-button type="primary" @click="openCreate"><PlusOutlined />新建任务</a-button>
      </div>
    </div>
    <a-table v-if="viewMode === 'table'" :columns="columns" :data-source="data" row-key="id" :pagination="{ pageSize: 8 }">
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
    <div v-else class="kanban">
      <section v-for="status in statusOrder" :key="status" class="kanban-col">
        <header class="kanban-head">
          <span class="kanban-title">
            <i class="kanban-dot" :style="{ background: columnAccent[status] }" />
            {{ TASK_STATUS[status].text }}
          </span>
          <span class="kanban-count">{{ columnLists[status].length }}</span>
        </header>
        <div class="kanban-body">
          <draggable
            class="kanban-list"
            :list="columnLists[status]"
            item-key="id"
            group="tasks"
            :animation="180"
            ghost-class="task-card-ghost"
            @start="onDragStart"
            @end="onDragEnd"
            @change="onColumnChange(status, $event)"
          >
            <template #item="{ element }">
              <div class="task-card" @click="openEdit(element as Task)">
                <div class="task-card-title">{{ element.title }}</div>
                <a-tag :color="PRIORITY[element.priority as Task['priority']].color">{{ PRIORITY[element.priority as Task['priority']].text }}</a-tag>
                <div class="task-card-foot">
                  <a-space v-if="staff.getById(element.assigneeId)" :size="6">
                    <a-avatar :size="22" :src="staff.getById(element.assigneeId)!.avatar" />
                    <span>{{ staff.getById(element.assigneeId)!.name }}</span>
                  </a-space>
                  <span v-else class="sub">（已离职）</span>
                  <span class="due"><CalendarOutlined />{{ element.deadline }}</span>
                </div>
              </div>
            </template>
          </draggable>
          <div v-if="columnLists[status].length === 0" class="kanban-empty">暂无任务</div>
        </div>
      </section>
    </div>
    <TaskFormModal v-model:open="modalOpen" :record="editing" @submit="onSubmit" />
  </a-card>
</template>
<style scoped>
.toolbar { display: flex; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.toolbar-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.sub { color: #8c8c8c; font-size: 12px; }
.kanban { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: start; }
.kanban-col { background: #f6f6fb; border-radius: 10px; padding: 12px; min-height: 420px; display: flex; flex-direction: column; }
.kanban-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-weight: 600; }
.kanban-title { display: inline-flex; align-items: center; gap: 8px; }
.kanban-dot { width: 8px; height: 8px; border-radius: 50%; }
.kanban-count { min-width: 22px; height: 22px; padding: 0 6px; border-radius: 11px; background: #fff; color: v-bind(THEME_PRIMARY); font-size: 12px; display: inline-flex; align-items: center; justify-content: center; }
.kanban-body { position: relative; flex: 1; }
.kanban-list { min-height: 280px; }
.task-card { background: #fff; border: 1px solid #f0f0f0; border-radius: 8px; padding: 12px; margin-bottom: 10px; cursor: grab; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04); user-select: none; }
.task-card:hover { border-color: v-bind(THEME_PRIMARY); }
.task-card:active { cursor: grabbing; }
.task-card-title { font-weight: 600; line-height: 1.45; margin-bottom: 8px; }
.task-card-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; row-gap: 6px; margin-top: 10px; font-size: 12px; color: #595959; flex-wrap: wrap; }
.task-card-foot :deep(.ant-space) { flex-shrink: 0; }
.due { color: #8c8c8c; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.kanban-empty { position: absolute; left: 0; right: 0; top: 48px; text-align: center; color: #bfbfbf; pointer-events: none; }
.task-card-ghost { opacity: 0.55; background: #f0f0ff; border: 1px dashed v-bind(THEME_PRIMARY); }
@media (max-width: 900px) {
  .kanban { grid-template-columns: 1fr; }
}
</style>
