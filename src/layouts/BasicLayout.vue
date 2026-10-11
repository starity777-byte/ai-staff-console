<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { DashboardOutlined, TeamOutlined, ProfileOutlined, MenuFoldOutlined, MenuUnfoldOutlined, RobotOutlined, BellOutlined } from '@ant-design/icons-vue'
import { THEME_PRIMARY } from '@/mock/constants'
import { useStaffStore } from '@/stores/staff'
import { useTaskStore } from '@/stores/task'
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
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" class="sider" collapsible :trigger="null" theme="light" width="208">
      <div class="logo"><RobotOutlined class="logo-mark" /><span v-if="!collapsed">AI 员工管理台</span></div>
      <a-menu theme="light" mode="inline" :selected-keys="selected" @click="({ key }: any) => router.push(key)">
        <a-menu-item v-for="m in menus" :key="m.key"><component :is="m.icon" /><span>{{ m.label }}</span></a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
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
          <a-badge :count="3" size="small"><BellOutlined style="font-size: 18px" /></a-badge>
          <a-avatar :style="{ background: THEME_PRIMARY }">管</a-avatar><span>管理员</span>
        </div>
      </a-layout-header>
      <a-layout-content class="content"><router-view /></a-layout-content>
    </a-layout>
  </a-layout>
</template>
<style scoped>
.sider { background: #fff; border-right: 1px solid #f0f0f0; }
.sider :deep(.ant-menu-inline) { border-inline-end: none; }
.logo { height: 64px; display: flex; align-items: center; justify-content: center; gap: 8px; color: rgba(0, 0, 0, 0.88); font-size: 17px; font-weight: 600; white-space: nowrap; }
.logo-mark { color: v-bind(THEME_PRIMARY); font-size: 20px; }
.header { background: #fff; padding: 0 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.trigger { font-size: 18px; cursor: pointer; }
.right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
.content { margin: 24px; }
</style>
