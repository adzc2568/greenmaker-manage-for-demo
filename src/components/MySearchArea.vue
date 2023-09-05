<template>
  <div class="flex flex-nowrap items-center gap-4">
    <div class="grid sm:grid-cols-4 gap-2">
      <slot></slot>
    </div>

    <div class="flex shrink-0 gap-2">
      <q-btn color="primary" unelevated @click="emit('searchSubmit')">查詢</q-btn>
      <q-btn color="grey" unelevated @click="emit('searchClear')">清除</q-btn>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['searchSubmit', 'searchClear'])
</script>

