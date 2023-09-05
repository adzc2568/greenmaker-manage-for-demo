<template>
  <div class="flex border">
    <q-btn
      title="插入列表(無排序)"
      icon="format_list_bulleted"
      unelevated
      @click="emit('btn-click', { key: 'listBullet' })"
    ></q-btn>
    <q-btn
      title="插入列表(排序)"
      icon="format_list_numbered"
      unelevated
      @click="emit('btn-click', { key: 'listNumber' })"
    ></q-btn>
    <q-btn title="插入圖片" icon="add_photo_alternate" unelevated @click="emit('btn-click', { key: 'image' })"></q-btn>

    <q-btn title="標題" unelevated>
      <q-icon name="title"></q-icon>
      <q-icon name="expand_more"></q-icon>

      <q-popup-proxy ref="headingPopupRef" self="top left">
        <q-list bordered separator>
          <q-item v-for="i in [2, 3]" :key="i" clickable @click="onHeadingClick(i)">
            <q-item-section>{{ `H${i}` }}</q-item-section>
          </q-item>
        </q-list>
      </q-popup-proxy>
    </q-btn>
    <q-btn title="粗體" icon="format_bold" unelevated @click="emit('btn-click', { key: 'textBold' })"></q-btn>
    <div class="flex relative">
      <q-btn title="文字顏色" unelevated class="relative">
        <q-icon name="format_color_text"></q-icon>
        <div class="absolute left-[15px] top-[26px] w-[26px] h-[4px] z-[1]" :style="`background:${currentColor}`"></div>

        <q-popup-proxy ref="popup" self="top middle">
          <color-picker @colorSelect="colorSelect"></color-picker>
        </q-popup-proxy>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ColorPicker from './ColorPicker.vue'
const emit = defineEmits(['btn-click'])

const popup = ref()
const headingPopupRef = ref()

const onHeadingClick = (heading) => {
  emit('btn-click', { key: 'heading', data: heading })
  headingPopupRef.value.hide()
}

const currentColor = ref('black')
const colorSelect = (color) => {
  currentColor.value = color
  popup.value.hide()
  emit('btn-click', {
    key: 'textColor',
    data: { color },
  })
}
</script>

