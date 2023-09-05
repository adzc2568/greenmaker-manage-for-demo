<template>
  <router-view />
</template>

<script setup>
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 對應 tailwind 四個斷點
$q.screen.setSizes({ sm: 640, md: 768, lg: 1024, xl: 1280 })

// $q.dark.set(true)
</script>

