<template>
  <div class="grid grid-cols-[repeat(19,minmax(0,1fr))] gap-1 p-2">
    <div
      class="cursor-pointer relative rounded-full border"
      :class="[`bg-black w-[${length}px] h-[${length}px]`, addSelectedClass('black')]"
      @mouseenter="selected = 'black'"
      @click="onColorPick('black')"
    ></div>
    <!-- <div
      class="cursor-pointer relative rounded-full border"
      :class="[`bg-white w-[${length}px] h-[${length}px]`, addSelectedClass('white')]"
      @mouseenter="selected = 'white'"
      @click="onColorPick('white')"
    ></div> -->
    <div class="col-[span_17_/_span_17]"></div>
    <div
      v-for="(color, index) in colorList"
      :key="index"
      class="cursor-pointer relative rounded-full border"
      :class="[`w-[${length}px] h-[${length}px]`, addSelectedClass(color)]"
      :style="`background:${color}`"
      @mouseenter="selected = color"
      @click="onColorPick(color)"
    ></div>
  </div>
</template>

<script setup>
import { colors } from 'quasar'
import { computed, ref } from 'vue'

const { getPaletteColor } = colors

const emit = defineEmits(['color-select'])

const selected = ref()

const length = 18
const addSelectedClass = (color) => {
  if (color === selected.value) {
    return `
      after:absolute after:top-[-1px] after:left-[-1px] after:block after:w-[${length}px] after:h-[${length}px] after:border after:border-orange-500 after:rounded-full
      before:absolute before:block before:w-[${length - 2}px] before:h-[${
      length - 2
    }px] before:border before:border-white before:rounded-full
    `
  } else {
    return null
  }
}

const colorItems = [
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'grey',
  'blue-grey',
]

const colorList = computed(() => {
  const arr = []

  for (let i = 1; i <= 14; i++) {
    arr.push(
      colorItems.map((color) => {
        return getPaletteColor(`${color}-${i}`)
      })
    )
  }

  return arr.flat()
})

const onColorPick = (color) => {
  selected.value = color
  emit('color-select', color)
}
</script>

