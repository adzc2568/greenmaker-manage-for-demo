<template>
  <teleport v-if="isLayoutMouted" to="#header-expand" :disabled="noFixed">
    <header>
      <slot>
        {{ title }}
      </slot>
    </header>
  </teleport>
</template>

<script setup>
import { inject } from 'vue'

const props = defineProps({
  title: String,
  noFixed: Boolean,
})

const isLayoutMouted = inject('isLayoutMouted')
</script>

