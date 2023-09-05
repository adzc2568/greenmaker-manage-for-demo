<template>
  <q-card class="my-dialog-content q-dialog-plugin" :style="{ width: contentWidth }">
    <div class="flex justify-between items-center text-h6 font-bold bg-blue-8 text-white pl-4">
      <div>{{ header }}</div>
      <q-btn round flat icon="close" @click="emit('close')"></q-btn>
    </div>

    <q-linear-progress v-if="loading" color="light-green" class="absolute" indeterminate></q-linear-progress>

    <q-card-section class="scroll h-full" :style="{ 'max-height': maxHeight + 'px' }">
      <div ref="containerRef" class="pb-1" :class="{ 'max-h-full': noScroll }">
        <slot :fullHeight="maxHeight - 36"></slot>
      </div>
    </q-card-section>

    <q-card-actions v-if="slots.actions !== undefined" align="right">
      <slot name="actions"></slot>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, useSlots, computed } from 'vue'

const slots = useSlots()
const containerRef = ref()

const props = defineProps({
  width: [String, Number],
  header: String,

  loading: Boolean,

  noScroll: Boolean,
})

const emit = defineEmits(['close'])

const contentWidth = computed(() => {
  if (typeof props.width === 'number') return `${props.width}px !important`
  else if (typeof props.width === 'string') {
    if (Number(props.width) >= 0) return `${props.width}px !important`
    else return props.width + ' !important'
  } else return null
})

const maxHeight = ref(Math.floor(document.documentElement.clientHeight - (slots.actions === undefined ? 90 : 142)))

defineExpose({
  fullWidth: computed(() => containerRef.value.offsetWidth),
  fullHeight: computed(() => maxHeight.value - 36),
})
</script>

