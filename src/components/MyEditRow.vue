<template>
  <q-tr
    :props="props.props"
    class="relative overflow-hidden"
    @mouseenter="!readonly ? onItemMouseenter($event) : undefined"
    @mouseleave="!readonly ? onItemMouseleave($event) : undefined"
  >
    <slot
      v-for="col in props.props.cols"
      :key="col.name"
      :col="col"
      :name="`body-cell-${col.name}`"
      :value="col.value"
      v-bind="props.props"
    >
      <q-td :props="{ col }">
        {{ col.value }}
      </q-td>
    </slot>

    <transition name="opacity">
      <div v-if="menuShow" class="absolute bottom-0 left-0 right-0 top-0 z-10 bg-[#eceff188]">
        <div class="flex-center flex h-full">
          <q-btn
            v-for="menuItem in menu"
            v-bind="QBtnProps"
            :key="menuItem.icon"
            :icon="menuItem.icon"
            round
            @click="emit('menu-click', menuItem.fn)"
          >
            <q-tooltip>
              {{ menuItem.label }}
            </q-tooltip>
          </q-btn>
        </div>
      </div>
    </transition>
  </q-tr>
</template>

<script setup>
import { ref } from 'vue'
import { QBtnProps } from 'utils/quasar/base-props.js'

const props = defineProps({
  menu: Array,
  props: Object,

  readonly: Boolean,
})

const emit = defineEmits(['menu-click'])

const menuShow = ref(false)

const onItemMouseenter = () => {
  menuShow.value = true
}
const onItemMouseleave = () => {
  menuShow.value = false
}
</script>

