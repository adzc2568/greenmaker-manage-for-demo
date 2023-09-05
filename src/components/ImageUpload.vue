<template>
  <q-card flat bordered class="h-full">
    <q-card-section>
      <div class="flex h-full flex-col flex-nowrap gap-2">
        <div v-if="!readonly" class="flex">
          <q-btn v-bind="QBtnProps" :icon="mode === 'grid' ? 'visibility' : 'grid_view'" @click="onModeChange"></q-btn>
          <q-space></q-space>
          <q-btn v-bind="QBtnProps" color="secondary" label="上傳圖片" @click="onUploadClick"></q-btn>
        </div>

        <q-tabs v-model="tab" align="left" active-color="primary" active-bg-color="blue-1">
          <q-tab label="文章圖片" name="images"></q-tab>
          <q-tab label="垃圾桶" name="deleteImages"></q-tab>
        </q-tabs>

        <q-separator></q-separator>

        <div v-if="currentImages.length === 0" class="mt-4 text-center">
          <q-icon name="warning" class="mr-2" size="sm"></q-icon>
          <span>沒有圖片</span>
        </div>

        <div v-if="currentImages.length > 0 && mode === 'grid'" class="select-none">
          <q-resize-observer @resize="onResize"></q-resize-observer>

          <div ref="imagesContainerRef" class="grid grid-cols-2 gap-2 sm:grid-cols-6">
            <div v-for="(image, imageIndex) in currentImages" :key="image._id" class="relative">
              <q-btn
                v-bind="QBtnProps"
                :icon="tab === 'images' ? 'close' : 'undo'"
                class="absolute -right-2 -top-3 z-10 bg-white"
                round
                outline
                dense
                size="sm"
                @click="tab === 'images' ? onDeleteClick(imageIndex) : onCancelDeleteClick(imageIndex)"
              ></q-btn>

              <q-card
                :style="{ width: cardWidth + 'px' }"
                flat
                bordered
                class="relative cursor-pointer select-none overflow-hidden"
                @click="selected ? onImageClick(image) : null"
              >
                <div class="bg-brown-11 flex-center flex" :style="{ height: (cardWidth * 3) / 4 + 'px' }">
                  <q-img :src="getImageSrc(image, true)" :ratio="4 / 3" :width="image.Width + 'px'"></q-img>
                </div>
                <transition v-if="selectable" name="opacity">
                  <div
                    v-if="selected && selected.find((item) => item._id === image._id)"
                    class="bg-green-1 flex-center absolute bottom-0 left-0 right-0 top-0 z-10 flex opacity-80"
                  >
                    <q-icon name="done" size="xl" color="green"></q-icon>
                  </div>
                </transition>
                <div v-if="!image.Thumb" class="absolute bottom-0 left-0 right-0 top-0 z-10 bg-[#eceff188]">
                  <div class="flex-center flex h-full">
                    <q-btn v-bind="QBtnProps" icon="crop" round @click="toImageEditor(image)"></q-btn>
                  </div>
                </div>
              </q-card>

              <div class="flex-center flex">
                <div>{{ image.Name }}</div>
                <q-btn v-if="!selectable" v-bind="QBtnProps" icon="edit" round size="sm">
                  <q-popup-edit v-model="image.Name" auto-save v-slot="scope">
                    <q-input
                      v-bind="QInputProps"
                      v-model="scope.value"
                      dense
                      autofocus
                      counter
                      @keyup.enter="scope.set"
                    ></q-input>
                  </q-popup-edit>
                </q-btn>
              </div>
            </div>
          </div>
        </div>

        <q-carousel
          v-if="currentImages.length > 0 && mode === 'view'"
          class="grow"
          swipeable
          animated
          v-model="slide"
          infinite
        >
          <q-carousel-slide v-for="image in currentImages" :key="image._id" :name="image._id">
            <div class="flex-center flex">
              <q-img :src="getImageSrc(image)"></q-img>
            </div>
          </q-carousel-slide>
          <template #control>
            <q-carousel-control position="bottom" class="left-[50%] -translate-x-[50%] overflow-x-auto">
              <div class="flex flex-nowrap gap-2">
                <q-img
                  v-for="image in currentImages"
                  :key="image._id"
                  :src="getImageSrc(image, true)"
                  width="80px"
                  height="60px"
                  class="shrink-0 rounded border"
                  @click="slide = image._id"
                ></q-img>
              </div>
            </q-carousel-control>
          </template>
        </q-carousel>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted, reactive, computed, nextTick } from 'vue'
import Sortable from 'sortablejs'
import { postUploadTempImage } from 'api'
import { useQuasar } from 'quasar'
import { QInputProps, QBtnProps } from 'utils/quasar/base-props'
import { cloneDeep } from 'lodash-es'
import ImageEditorDialog from './ImageEditorDialog.vue'
import mitt from 'mitt'

const emitter = mitt()
const $q = useQuasar()

const props = defineProps({
  parentId: String,
  type: String,
  images: Array,
  selectable: Boolean,
  selected: Array,

  readonly: Boolean,
})

const emit = defineEmits(['update:images', 'update:selected'])

const tab = ref('images')
const currentImages = computed(() => (tab.value === 'images' ? props.images : deleteImages.value))

const deleteImages = ref([])

const onDeleteClick = (index) => {
  deleteImages.value = deleteImages.value.concat(props.images.slice(index, 1))
  emit('update:images', props.images.toSpliced(index, 1))
}

const onCancelDeleteClick = (index) => {
  emit('update:images', props.images.concat(deleteImages.value.slice(index, 1)))
  deleteImages.value = deleteImages.value.toSpliced(index, 1)
}

const mode = ref('grid')
const onModeChange = async () => {
  mode.value = mode.value === 'grid' ? 'view' : 'grid'
  if (mode.value === 'grid') {
    await nextTick()
    setSortable()
  }
}

const onDragUpdate = (evt) => {
  const oldIndex = evt.oldIndex
  const newIndex = evt.newIndex
  const list = cloneDeep(props.images)
  list.splice(newIndex, 0, list.splice(oldIndex, 1)[0])
  emit('update:images', list)
}

const imagesContainerRef = ref()
const setSortable = () => {
  if (props.images.length > 0) {
    new Sortable(imagesContainerRef.value, {
      group: 'images',
      animation: 150,
      onUpdate: onDragUpdate,
    })
  }
}

onMounted(setSortable)

const onImageClick = (image) => {
  const index = props.selected.findIndex((item) => item._id === image._id)
  if (index !== -1) emit('update:selected', props.selected.slice(0, index).concat(props.selected.slice(index + 1)))
  else emit('update:selected', [...props.selected, image])
}

const onUploadClick = () => {
  const uploader = document.createElement('input')
  uploader.setAttribute('type', 'file')
  uploader.setAttribute('accept', 'image/*')
  uploader.setAttribute('multiple', 'true')
  uploader.onchange = async (evt) => {
    const files = evt.target.files

    if (files.length === 0) {
      // 取消，沒有上傳
      return
    }

    const secondFilename = /(.+)\.(jpg|jpeg|png)/i
    const filter = Array.from(files).filter((file) => secondFilename.test(file.name))
    if (filter.length < files.length) {
      $q.notify({
        position: 'top',
        color: 'negative',
        message: '檢查到圖片包含 jpg、jpeg、png 以外之副檔名，請上傳正確的圖片類型',
      })
    }

    const tasks = filter.map((file) => {
      const formData = new FormData()
      formData.append('Image', file)
      formData.append('Type', props.type)
      if (props.parentId) formData.append('ParentId', props.parentId)

      return postUploadTempImage(formData)
    })

    const res = await Promise.all(tasks)

    const result = res.reduce(
      (obj, { data, error }) => {
        if (data) obj.Success.push(data)
        if (error) obj.Error.push(error)

        return obj
      },
      {
        Success: [],
        Error: [],
      }
    )

    if (result.Error.length > 0) {
      $q.notify({
        type: 'negative',
        message: '圖片上傳失敗：' + JSON.stringify(result.Error),
        position: 'top',
      })
    }

    if (result.Success.length > 0) {
      emit('update:images', props.images.concat(result.Success))
      $q.notify({
        type: 'positive',
        message: '圖片上傳成功',
        position: 'top',
      })

      for (let i = 0; i < result.Success.length; i++) {
        const image = result.Success[i]
        toImageEditor(image)
        await new Promise((resolve) => {
          emitter.on('crop-finish', () => {
            emitter.off('crop-finish')
            resolve()
          })
        })
      }
    }
  }
  uploader.click()
}

const containerSize = ref()
const onResize = (size) => {
  containerSize.value = size
}

const cardWidth = computed(() => {
  if (!containerSize.value) return
  const gapWidth = 16
  switch ($q.screen.name) {
    case 'xs':
      return (containerSize.value.width - gapWidth) / 2
    default:
      return (containerSize.value.width - 5 * gapWidth) / 6
  }
})

const getImageSrc = (image, isThumb = false) => {
  const basePath = isThumb && image.Thumb ? image.Thumb.BasePath : image.Origin.BasePath
  return image.Temp
    ? `${process.env.API_HOST}/${basePath}`
    : `https://firebasestorage.googleapis.com/v0/b/mrgreen-dbf25.appspot.com/o/${basePath}?alt=media`
}

const toImageEditor = (image) => {
  $q.dialog({
    component: ImageEditorDialog,
    componentProps: {
      image,
    },
  }).onOk((cropData) => {
    const index = props.images.findIndex(({ _id }) => _id === image._id)
    emit('update:images', props.images.toSpliced(index, 1, { ...props.images[index], cropData }))
    emitter.emit('crop-finish')
  })
}

const slide = ref(props.images[0]?._id)
</script>

