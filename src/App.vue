<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'
import { THEME_PRIMARY } from '@/mock/constants'

dayjs.locale('zh-cn')

// Progress paints with colorInfo (and colorSuccess when status is success), not colorPrimary.
const theme: ThemeConfig = {
  token: {
    colorPrimary: THEME_PRIMARY,
    colorInfo: THEME_PRIMARY
  },
  components: {
    Menu: {
      colorItemBgSelected: '#f0f0ff',
      colorItemTextSelected: THEME_PRIMARY,
      colorItemBgHover: '#f7f7fb',
      colorActiveBarWidth: 0,
      colorActiveBarBorderSize: 0
    },
    Progress: {
      colorInfo: THEME_PRIMARY,
      colorSuccess: THEME_PRIMARY
    }
  }
}
</script>
<template>
  <a-config-provider :locale="zhCN" :theme="theme">
    <router-view />
  </a-config-provider>
</template>
