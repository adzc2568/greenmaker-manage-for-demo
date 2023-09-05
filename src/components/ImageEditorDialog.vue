<template>
  <q-dialog ref="dialogRef" full-width full-height>
    <my-dialog-content ref="myDialogContentRef" header="圖片剪裁" :width="1280" no-scroll @close="onDialogCancel">
      <template #default="{ fullHeight }">
        <div class="flex-center flex flex-col gap-2">
          <div
            class="max-w-full"
            :style="{
              'max-height': fullHeight + 'px',
              width: image.Origin.Width + 'px',
              height: image.Origin.Height + 'px',
            }"
          >
            <img ref="imgRef" :src="getImageSrc(image)" class="hidden" />
          </div>
        </div>
      </template>

      <template #actions>
        <q-btn v-bind="QBtnProps" color="grey" label="取消" @click="onDialogCancel" />
        <q-btn v-bind="QBtnProps" color="primary" label="確定" :loading="loading" @click="onSaveClick" />
      </template>
    </my-dialog-content>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { useQuasar } from 'quasar'
import { QBtnProps } from 'utils/quasar/base-props'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { postCropTempImage } from 'api'

const $q = useQuasar()
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const myDialogContentRef = ref()

const props = defineProps({
  image: Object,
})

const imgRef = ref()

const getImageSrc = (image) => {
  return `${process.env.API_HOST}/${image.Origin.BasePath}`
}

const loading = ref(false)
const onSaveClick = async () => {
  loading.value = true
  const data = cropper.value.getData()

  const cropData = {
    Top: Math.floor(data.y),
    Left: Math.floor(data.x),
    Width: Math.floor(data.width),
    Height: Math.floor(data.height),
  }

  const body = {
    _id: props.image._id,
    Type: props.image.Type,
    Origin: props.image.Origin,
    ...cropData,
  }
  const { error } = await postCropTempImage(body)

  if (!error) {
    onDialogOK(cropData)
  }
  loading.value = false
}

const cropper = ref()
const init = () => {
  const unwatch = watch(imgRef, async (val) => {
    await new Promise((resolve) => {
      if (myDialogContentRef.value) {
        resolve()
      } else {
        const unwatch = () => {
          watch(myDialogContentRef, () => {
            unwatch()
            resolve()
          })
        }
      }
    })

    const containerSize = {
      width: myDialogContentRef.value.fullWidth,
      height: myDialogContentRef.value.fullHeight,
    }

    const baseSize = {
      Plant: [768, 768],
      Article: [1920, 1080],
    }

    const aspectRatio = {
      Plant: 1,
      Article: 16 / 9,
    }

    const baseWidth = baseSize[props.image.Type][0]
    const baseHeigth = baseSize[props.image.Type][1]

    const minCropBox = {
      minCropBoxWidth: Math.floor((containerSize.width / props.image.Width) * baseWidth),
      minCropBoxHeight: Math.floor((containerSize.height / props.image.Height) * baseHeigth),
    }

    cropper.value = new Cropper(val, {
      data: props.image.cropData
        ? {
            y: props.image.cropData.Top,
            x: props.image.cropData.Left,
            width: props.image.cropData.Width,
            height: props.image.cropData.Height,
          }
        : undefined,
      aspectRatio: aspectRatio[props.image.Type],
      viewMode: 2,
      background: true,
      autoCropArea: 1,
      zoomable: false,
      ...minCropBox,
    })

    unwatch()
  })
}
init()
</script>

