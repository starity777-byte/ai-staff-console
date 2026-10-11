import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import router from './router'

import { useAppStore } from './stores/app'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)
app.use(pinia)
useAppStore()
app.use(router).mount('#app')
