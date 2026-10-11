import { beforeEach, describe, expect, it } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useAppStore, type ThemeMode } from '@/stores/app'

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
  document.documentElement.classList.remove('dark')
})

describe('app theme store', () => {
  it('starts in light mode and applies it to the document', () => {
    const store = useAppStore()
    expect(store.theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('switches theme with setTheme and toggleTheme', async () => {
    const store = useAppStore()
    store.setTheme('dark')
    expect(store.theme).toBe('dark')
    await nextTick()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')

    store.toggleTheme()
    expect(store.theme).toBe('light')
    await nextTick()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    store.toggleTheme()
    expect(store.theme).toBe('dark')
    store.setTheme('light')
    expect(store.theme).toBe('light')
    store.setTheme('nope' as ThemeMode)
    expect(store.theme).toBe('light')
  })

  it('falls back to light when the theme value is invalid', async () => {
    const store = useAppStore()
    store.setTheme('dark')
    await nextTick()
    store.theme = 'system' as ThemeMode
    await nextTick()
    expect(store.theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(JSON.parse(localStorage.getItem('app')!)).toEqual({ theme: 'light' })
  })

  it('persists only the theme and restores it on a new pinia', async () => {
    const store = useAppStore()
    store.setTheme('dark')
    await nextTick()
    expect(JSON.parse(localStorage.getItem('app')!)).toEqual({ theme: 'dark' })

    activatePinia()
    const restored = useAppStore()
    expect(restored.theme).toBe('dark')
    await nextTick()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')

    restored.toggleTheme()
    await nextTick()
    expect(JSON.parse(localStorage.getItem('app')!)).toEqual({ theme: 'light' })
    activatePinia()
    expect(useAppStore().theme).toBe('light')
  })
})
