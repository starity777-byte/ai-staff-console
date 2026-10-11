import { createRouter, createWebHistory } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [{
    path: '/', component: BasicLayout, redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: () => import('@/views/Dashboard.vue'), meta: { title: '数据看板' } },
      { path: 'staff', component: () => import('@/views/StaffList.vue'), meta: { title: '员工列表' } },
      { path: 'tasks', component: () => import('@/views/TaskManage.vue'), meta: { title: '任务管理' } }
    ]
  }]
})
