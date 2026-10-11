<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, theme } from 'ant-design-vue'
import { DashboardOutlined, TeamOutlined, ProfileOutlined, MenuFoldOutlined, MenuUnfoldOutlined, RobotOutlined, BellOutlined } from '@ant-design/icons-vue'
import { THEME_PRIMARY } from '@/mock/constants'
import { useAppStore } from '@/stores/app'
import { useStaffStore } from '@/stores/staff'
import { useTaskStore } from '@/stores/task'
const { token } = theme.useToken()
const appStore = useAppStore()
const isDark = computed(() => appStore.theme === 'dark')
const themeLabel = computed(() => (isDark.value ? '切换浅色模式' : '切换深色模式'))
const brandColor = computed(() => (isDark.value ? token.value.colorPrimaryHover : THEME_PRIMARY))
watchEffect(() => {
  const background = token.value.colorBgLayout
  document.documentElement.style.backgroundColor = background
  document.body.style.backgroundColor = background
  document.body.style.color = token.value.colorText
})
const collapsed = ref(false)
const route = useRoute()
const router = useRouter()
const staffStore = useStaffStore()
const taskStore = useTaskStore()
const menus = [
  { key: '/dashboard', label: '数据看板', icon: DashboardOutlined },
  { key: '/staff', label: '员工列表', icon: TeamOutlined },
  { key: '/tasks', label: '任务管理', icon: ProfileOutlined }
]
const selected = computed(() => {
  const activeMenu = route.meta.activeMenu
  if (typeof activeMenu === 'string') return [activeMenu]
  const hit = menus.find((item) => route.path === item.key || route.path.startsWith(`${item.key}/`))
  return [hit?.key ?? route.path]
})
const parentCrumb = computed(() => {
  const activeMenu = route.meta.activeMenu
  if (typeof activeMenu !== 'string') return null
  const item = menus.find((menu) => menu.key === activeMenu)
  return item ? { path: item.key, label: item.label } : null
})
const title = computed(() => (route.meta.title as string) || '')
function resetToSample() {
  staffStore.resetToSample()
  taskStore.resetToSample()
  message.success('已重置为示例数据')
}
</script>
<template>
  <a-layout class="shell">
    <a-layout-sider v-model:collapsed="collapsed" class="sider" collapsible :trigger="null" theme="light" width="208">
      <div class="logo"><RobotOutlined class="logo-mark" /><span v-if="!collapsed">AI 员工管理台</span></div>
      <a-menu theme="light" mode="inline" :selected-keys="selected" @click="({ key }: any) => router.push(key)">
        <a-menu-item v-for="m in menus" :key="m.key"><component :is="m.icon" /><span>{{ m.label }}</span></a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout class="main">
      <a-layout-header class="header">
        <component :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined" class="trigger" @click="collapsed = !collapsed" />
        <a-breadcrumb>
          <a-breadcrumb-item>首页</a-breadcrumb-item>
          <a-breadcrumb-item v-if="parentCrumb"><router-link :to="parentCrumb.path">{{ parentCrumb.label }}</router-link></a-breadcrumb-item>
          <a-breadcrumb-item>{{ title }}</a-breadcrumb-item>
        </a-breadcrumb>
        <div class="right">
          <a-popconfirm title="确定重置为示例数据？" ok-text="重置" cancel-text="取消" @confirm="resetToSample">
            <a-button>重置示例数据</a-button>
          </a-popconfirm>
          <a-tooltip :title="themeLabel">
            <a-button type="text" class="theme-toggle" :aria-pressed="isDark" :aria-label="themeLabel" @click="appStore.toggleTheme()">
              <template #icon>
                <svg v-if="isDark" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
                <svg v-else class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </template>
            </a-button>
          </a-tooltip>
          <a-badge :count="3" size="small"><BellOutlined class="bell" /></a-badge>
          <a-avatar :style="{ background: THEME_PRIMARY }">管</a-avatar><span>管理员</span>
        </div>
      </a-layout-header>
      <a-layout-content class="content"><router-view /></a-layout-content>
    </a-layout>
  </a-layout>
</template>
<style scoped>
.shell { min-height: 100vh; background: v-bind('token.colorBgLayout'); }
.main { background: v-bind('token.colorBgLayout'); color: v-bind('token.colorText'); }
.sider { background: v-bind('token.colorBgContainer'); border-right: 1px solid v-bind('token.colorBorderSecondary'); }
.sider :deep(.ant-menu-inline) { border-inline-end: none; }
.logo { height: 64px; display: flex; align-items: center; justify-content: center; gap: 8px; color: v-bind('token.colorText'); font-size: 17px; font-weight: 600; white-space: nowrap; }
.logo-mark { color: v-bind(brandColor); font-size: 20px; }
.header { background: v-bind('token.colorBgContainer'); color: v-bind('token.colorText'); padding: 0 24px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid v-bind('token.colorBorderSecondary'); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); }
.trigger { font-size: 18px; cursor: pointer; color: v-bind('token.colorText'); }
.right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
.theme-toggle { color: v-bind('token.colorText'); }
.theme-icon { width: 18px; height: 18px; display: block; }
.bell { font-size: 18px; color: v-bind('token.colorText'); }
.content { margin: 24px; color: v-bind('token.colorText'); }
@media (max-width: 768px) {
  .shell.ant-layout .header {
    height: auto;
    min-height: 64px;
    line-height: 1.5;
    flex-wrap: wrap;
    row-gap: 4px;
    padding: 8px 12px;
  }
  .right { flex: 1 1 100%; justify-content: flex-end; margin-left: 0; }
}
</style>
