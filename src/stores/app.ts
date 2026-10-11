import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

function applyDocumentTheme(mode: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.setAttribute('data-theme', mode)
  root.style.colorScheme = mode
}

export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeMode>('light')

  function setTheme(mode: ThemeMode) {
    theme.value = mode === 'dark' ? 'dark' : 'light'
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  watch(theme, (mode) => {
    if (mode !== 'light' && mode !== 'dark') {
      theme.value = 'light'
      return
    }
    applyDocumentTheme(mode)
  }, { immediate: true })

  return { theme, setTheme, toggleTheme }
}, {
  persist: { storage: localStorage, pick: ['theme'] }
})
