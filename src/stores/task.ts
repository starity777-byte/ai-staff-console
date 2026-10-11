import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import type { ActivityType, Task, TaskStatus } from '@/types'
import { mockTasks, mockActivities } from '@/mock'
import { useStaffStore } from '@/stores/staff'

export const useTaskStore = defineStore('task', () => {
  const list = ref<Task[]>(structuredClone(mockTasks))
  const activities = ref(structuredClone(mockActivities))
  const doingCount = computed(() => list.value.filter((t) => t.status === 'doing').length)
  const doneCount = computed(() => list.value.filter((t) => t.status === 'done').length)
  const completionRate = computed(() => list.value.length ? Math.round((doneCount.value / list.value.length) * 100) : 0)

  function addActivity(content: string, type: ActivityType, staffId?: number) {
    const id = activities.value.reduce((max, item) => Math.max(max, item.id), 0) + 1
    activities.value.unshift({ id, time: dayjs().format('MM-DD HH:mm'), content, type, staffId })
  }

  function logStatusChange(taskItem: Task) {
    const name = useStaffStore().getById(taskItem.assigneeId)?.name
    const type: ActivityType = taskItem.status === 'done' ? 'task_completed' : taskItem.status === 'doing' ? 'task_started' : 'other'
    const action = taskItem.status === 'done'
      ? `完成了「${taskItem.title}」`
      : taskItem.status === 'doing'
        ? `开始处理「${taskItem.title}」`
        : `将「${taskItem.title}」移至待开始`
    addActivity(name ? `${name} ${action}` : action, type, taskItem.assigneeId)
  }

  function logHighPriority(taskItem: Task) {
    const name = useStaffStore().getById(taskItem.assigneeId)?.name
    const content = name
      ? `${name} 的任务「${taskItem.title}」被标记为高优先级`
      : `任务「${taskItem.title}」被标记为高优先级`
    addActivity(content, 'task_urgent', taskItem.assigneeId)
  }

  function logStaffJoined(staff: { id: number; name: string; model: string }) {
    addActivity(`新员工 ${staff.name}（${staff.model}）加入团队`, 'staff_joined', staff.id)
  }

  function add(data: Omit<Task, 'id'>) {
    const id = Math.max(0, ...list.value.map((t) => t.id)) + 1
    const created: Task = { ...data, id }
    list.value.unshift(created)
    if (created.status === 'done' || created.status === 'doing') logStatusChange(created)
    if (created.priority === 'high') logHighPriority(created)
  }
  function update(id: number, data: Partial<Omit<Task, 'id'>>) {
    const current = list.value.find((t) => t.id === id)
    if (!current) return
    const prevStatus = current.status
    const prevPriority = current.priority
    Object.assign(current, data)
    if (data.status !== undefined && data.status !== prevStatus) logStatusChange(current)
    if (data.priority === 'high' && data.priority !== prevPriority) logHighPriority(current)
  }
  function updateStatus(id: number, status: TaskStatus) {
    update(id, { status })
  }
  function remove(id: number) { list.value = list.value.filter((t) => t.id !== id) }
  function resetToSample() {
    list.value = structuredClone(mockTasks)
    activities.value = structuredClone(mockActivities)
  }
  return { list, activities, doingCount, doneCount, completionRate, add, update, updateStatus, remove, resetToSample, logStaffJoined }
}, {
  persist: { storage: localStorage }
})
