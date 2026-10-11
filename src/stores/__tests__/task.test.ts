import { beforeEach, describe, expect, it } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { mockActivities, mockTasks } from '@/mock'
import { useTaskStore } from '@/stores/task'
import type { Task } from '@/types'

function activatePinia() {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return pinia
}

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  activatePinia()
})

const sample = (patch: Partial<Omit<Task, 'id'>> = {}): Omit<Task, 'id'> => ({
  title: '编写发布说明',
  assigneeId: 1,
  progress: 0,
  status: 'todo',
  priority: 'low',
  deadline: '2026-10-31',
  ...patch
})

describe('task store', () => {
  it('computes doing count, done count, and completion rate', () => {
    const store = useTaskStore()
    expect(store.list).toHaveLength(mockTasks.length)
    expect(store.activities).toHaveLength(mockActivities.length)
    expect(store.doingCount).toBe(4)
    expect(store.doneCount).toBe(3)
    expect(store.completionRate).toBe(33)

    const ids = store.list.map((item) => item.id)
    ids.forEach((id) => store.remove(id))
    expect(store.list).toHaveLength(0)
    expect(store.doingCount).toBe(0)
    expect(store.doneCount).toBe(0)
    expect(store.completionRate).toBe(0)
  })

  it('creates, updates, and deletes tasks and writes activity logs', () => {
    const store = useTaskStore()
    store.add(sample())
    expect(store.list[0]).toMatchObject({ id: 10, title: '编写发布说明', status: 'todo' })
    expect(store.activities).toHaveLength(mockActivities.length)

    store.add(sample({ title: '紧急修复', status: 'doing', priority: 'high', progress: 20 }))
    expect(store.list[0].id).toBe(11)
    expect(store.doingCount).toBe(5)
    expect(store.activities[0]).toMatchObject({
      type: 'task_urgent',
      staffId: 1,
      content: '小智 的任务「紧急修复」被标记为高优先级'
    })
    expect(store.activities[1]).toMatchObject({
      type: 'task_started',
      content: '小智 开始处理「紧急修复」'
    })
    expect(store.activities[0].time).toMatch(/^\d{2}-\d{2} \d{2}:\d{2}$/)

    store.update(11, { title: '紧急修复已更名', priority: 'medium' })
    expect(store.list.find((item) => item.id === 11)?.title).toBe('紧急修复已更名')
    expect(store.activities[0].type).toBe('task_urgent')

    store.update(11, { priority: 'high' })
    expect(store.activities[0].type).toBe('task_urgent')
    expect(store.activities[0].content).toContain('紧急修复已更名')

    const urgentCount = store.activities.filter((item) => item.type === 'task_urgent').length
    store.update(11, { priority: 'high', progress: 40 })
    expect(store.activities.filter((item) => item.type === 'task_urgent')).toHaveLength(urgentCount)

    store.update(404, { title: '不存在' })
    expect(store.list.some((item) => item.title === '不存在')).toBe(false)

    store.remove(11)
    expect(store.list.some((item) => item.id === 11)).toBe(false)
    store.remove(404)
    expect(store.list.some((item) => item.id === 10)).toBe(true)
  })

  it('moves a card across kanban columns and logs each status change', () => {
    const store = useTaskStore()
    const untouched = store.list.filter((item) => item.id !== 5).map((item) => ({ id: item.id, status: item.status }))
    expect(store.list.find((item) => item.id === 5)?.status).toBe('todo')

    store.updateStatus(5, 'doing')
    expect(store.list.find((item) => item.id === 5)?.status).toBe('doing')
    expect(store.doingCount).toBe(5)
    expect(store.activities[0]).toMatchObject({
      type: 'task_started',
      staffId: 5,
      content: '小慧 开始处理「整理常见问题知识库」'
    })

    const afterStart = store.activities.length
    store.updateStatus(5, 'doing')
    expect(store.activities).toHaveLength(afterStart)

    store.updateStatus(5, 'done')
    expect(store.list.find((item) => item.id === 5)?.status).toBe('done')
    expect(store.doneCount).toBe(4)
    expect(store.activities[0]).toMatchObject({
      type: 'task_completed',
      content: '小慧 完成了「整理常见问题知识库」'
    })

    store.updateStatus(5, 'todo')
    expect(store.list.find((item) => item.id === 5)?.status).toBe('todo')
    expect(store.activities[0]).toMatchObject({
      type: 'other',
      content: '小慧 将「整理常见问题知识库」移至待开始'
    })
    for (const item of untouched) {
      expect(store.list.find((task) => task.id === item.id)?.status).toBe(item.status)
    }
  })

  it('logs a status change for an unassigned or removed employee without throwing', () => {
    const store = useTaskStore()
    store.add(sample({ assigneeId: 999, status: 'done', progress: 100, title: '无人认领' }))
    expect(store.activities[0].content).toBe('完成了「无人认领」')
    expect(store.activities[0].type).toBe('task_completed')
    expect(store.completionRate).toBe(40)
  })

  it('resets tasks and activities to the sample data', () => {
    const store = useTaskStore()
    store.add(sample({ title: '临时任务', status: 'doing', priority: 'high' }))
    store.remove(1)
    store.resetToSample()
    expect(store.list.map((item) => item.id)).toEqual(mockTasks.map((item) => item.id))
    expect(store.activities.map((item) => item.id)).toEqual(mockActivities.map((item) => item.id))
    expect(store.completionRate).toBe(33)
  })

  it('persists tasks and activities in localStorage', async () => {
    const store = useTaskStore()
    store.updateStatus(8, 'doing')
    await nextTick()
    const raw = localStorage.getItem('task')
    expect(raw).toBeTruthy()
    const saved = JSON.parse(raw!) as { list: Task[]; activities: { content: string; type: string }[] }
    expect(saved.list.find((item) => item.id === 8)?.status).toBe('doing')
    expect(saved.activities[0].content).toContain('云舒 开始处理')
    expect(saved.activities[0].type).toBe('task_started')

    activatePinia()
    const restored = useTaskStore()
    expect(restored.list.find((item) => item.id === 8)?.status).toBe('doing')
    expect(restored.activities[0].content).toContain('云舒 开始处理')
    expect(restored.doingCount).toBe(5)
  })
})
