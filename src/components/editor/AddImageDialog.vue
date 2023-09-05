<template>
  <q-dialog ref="dialogRef" full-width full-height>
    <my-dialog-content header="圖片管理" :width="1280" @close="onDialogCancel">
      <template #default="{ fullHeight }">
        <image-upload
          ref="uploadImageRef"
          :parentId="id"
          :type="type"
          :style="{ height: fullHeight + 'px' }"
          v-model:images="imagesRef"
          @update:images="(val) => emit('update:images', val)"
          :selectable="selectable"
          :draggable="draggable"
          v-model:selected="selected"
        ></image-upload>
      </template>

      <template v-if="selectable" #actions>
        <q-btn v-bind="QBtnProps" color="grey" label="取消" @click="onDialogCancel" />
        <q-btn v-bind="QBtnProps" color="primary" label="確定" @click="onPermitClick" />
      </template>
    </my-dialog-content>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import ImageUpload from 'components/ImageUpload.vue'
import { useQuasar } from 'quasar'
import { QBtnProps } from 'utils/quasar/base-props'

const $q = useQuasar()
const uploadImageRef = ref()
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  id: String,
  type: String,
  images: Array,
  selectable: Boolean,
  draggable: Boolean,
})

const emit = defineEmits(['update:images'])
const imagesRef = ref(props.images)

const selected = ref([])

const onPermitClick = () => {
  if (selected.value.length === 0) {
    $q.notify({
      type: 'negative',
      message: '請選擇圖片',
      position: 'top',
    })
    return
  }
  onDialogOK(selected.value)
}
</script>

