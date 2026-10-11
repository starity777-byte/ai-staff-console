import { beforeEach, describe, expect, it } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { mockStaff } from '@/mock'
import { useStaffStore } from '@/stores/staff'
import { useTaskStore } from '@/stores/task'

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

describe('staff store', () => {
  it('exposes list getters for online count, model stats, and lookup', () => {
    const store = useStaffStore()
    expect(store.list).toHaveLength(mockStaff.length)
    expect(store.onlineCount).toBe(6)
    expect(store.getById(1)?.name).toBe('小智')
    expect(store.getById(999)).toBeUndefined()
    expect(store.modelStats).toEqual([
      { model: 'Grok Build', count: 2 },
      { model: 'Gemini 3.1 Pro', count: 2 },
      { model: 'Claude Sonnet 4.6', count: 2 },
      { model: 'GPT-5', count: 1 },
      { model: 'DeepSeek V3', count: 1 }
    ])
    expect(JSON.stringify(store.list)).not.toMatch(/dicebear/i)
    expect(store.list.every((item) => item.avatar == null)).toBe(true)
  })

  it('adds, updates, and removes staff without an online avatar', () => {
    const store = useStaffStore()
    const tasks = useTaskStore()
    const before = tasks.activities.length
    store.add({ name: '新禾', model: 'GPT-5', role: '客服专员', status: 'online', skills: ['工单'] })
    expect(store.list[0]).toMatchObject({
      id: 9,
      name: '新禾',
      model: 'GPT-5',
      role: '客服专员',
      status: 'online',
      skills: ['工单'],
      createdAt: new Date().toISOString().slice(0, 10)
    })
    expect(store.list[0].avatar).toBeUndefined()
    expect(store.onlineCount).toBe(7)
    expect(store.modelStats.find((item) => item.model === 'GPT-5')?.count).toBe(2)
    expect(tasks.activities).toHaveLength(before + 1)
    expect(tasks.activities[0]).toMatchObject({
      type: 'staff_joined',
      staffId: 9,
      content: '新员工 新禾（GPT-5）加入团队'
    })

    store.update(9, { role: '内容运营', status: 'offline' })
    expect(store.getById(9)).toMatchObject({ role: '内容运营', status: 'offline', id: 9 })
    expect(store.onlineCount).toBe(6)
    store.update(404, { name: '不存在' })
    expect(store.list).toHaveLength(9)

    store.remove(9)
    expect(store.getById(9)).toBeUndefined()
    expect(store.list).toHaveLength(8)
    store.remove(404)
    expect(store.list).toHaveLength(8)
  })

  it('assigns id 1 when the list is empty and restores the sample', () => {
    const store = useStaffStore()
    store.list.splice(0, store.list.length)
    store.add({ name: '空表', model: 'DeepSeek V3', role: '后端工程师', status: 'busy', skills: ['Go'] })
    expect(store.list).toHaveLength(1)
    expect(store.list[0].id).toBe(1)
    store.resetToSample()
    expect(store.list.map((item) => item.id)).toEqual(mockStaff.map((item) => item.id))
    expect(store.list[0]).not.toBe(mockStaff[0])
  })

  it('persists the staff list in localStorage', async () => {
    const store = useStaffStore()
    store.add({ name: '新禾', model: 'GPT-5', role: '客服专员', status: 'online', skills: ['工单'] })
    store.remove(2)
    await nextTick()
    const raw = localStorage.getItem('staff')
    expect(raw).toBeTruthy()
    const saved = JSON.parse(raw!) as { list: { id: number; name: string; avatar?: string }[] }
    expect(saved.list[0].name).toBe('新禾')
    expect(saved.list[0].avatar).toBeUndefined()
    expect(saved.list.some((item) => item.id === 2)).toBe(false)
    expect(raw).not.toMatch(/dicebear/i)

    localStorage.setItem('staff', raw!)
    activatePinia()
    const restored = useStaffStore()
    expect(restored.list[0].name).toBe('新禾')
    expect(restored.getById(2)).toBeUndefined()
    expect(restored.onlineCount).toBe(restored.list.filter((item) => item.status !== 'offline').length)
  })
})
