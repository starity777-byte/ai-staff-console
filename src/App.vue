<script setup lang="ts">
import { computed } from 'vue'
import { theme } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'
import { THEME_PRIMARY } from '@/mock/constants'
import { useAppStore } from '@/stores/app'

dayjs.locale('zh-cn')

const appStore = useAppStore()

const antdTheme = computed<ThemeConfig>(() => {
  const dark = appStore.theme === 'dark'
  const seed = {
    ...theme.defaultSeed,
    colorPrimary: THEME_PRIMARY,
    colorInfo: THEME_PRIMARY
  }
  const mapToken = dark ? theme.darkAlgorithm(seed) : theme.defaultAlgorithm(seed)
  return {
    algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#5b5bd6',
      colorInfo: THEME_PRIMARY,
      ...(dark ? { colorLink: mapToken.colorPrimaryHover } : {})
    },
    components: {
      Layout: {
        colorBgHeader: mapToken.colorBgContainer,
        colorBgBody: mapToken.colorBgLayout,
        colorBgTrigger: mapToken.colorBgContainer
      },
      Menu: {
        colorItemBgSelected: dark ? mapToken.colorPrimaryBg : '#f0f0ff',
        colorItemTextSelected: dark ? mapToken.colorPrimaryHover : THEME_PRIMARY,
        colorItemBgHover: dark ? mapToken.colorFillSecondary : '#f7f7fb',
        colorActiveBarWidth: 0,
        colorActiveBarBorderSize: 0
      },
      Progress: {
        colorInfo: THEME_PRIMARY,
        colorSuccess: THEME_PRIMARY
      }
    }
  }
})
</script>
<template>
  <a-config-provider :locale="zhCN" :theme="antdTheme">
    <router-view />
  </a-config-provider>
</template>
<style>
html.dark { color-scheme: dark; }
</style>
