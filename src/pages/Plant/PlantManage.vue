<template>
  <q-page class="p-4">
    <my-search-area @searchSubmit="searchSubmit" @searchClear="searchClear">
      <q-select
        v-bind="QSelectProps"
        v-model="search.Family"
        label="科名"
        :options="taxonomyFamilyItems"
        option-label="Name"
        option-value="Id"
        emit-value
        map-options
      ></q-select>
      <q-select
        v-bind="QSelectProps"
        v-model="search.Genus"
        label="屬名"
        :options="taxonomyGenusItems"
        option-label="Name"
        option-value="Id"
        emit-value
        map-options
      ></q-select>
      <q-input v-bind="QInputProps" v-model="search.ScientificName" label="學名"></q-input>
      <q-input v-bind="QInputProps" v-model="search.BusinessName" label="商業名稱"></q-input>
    </my-search-area>

    <q-card flat bordered class="mt-2 [&>.q-card\_\_section:not(:first-child)]:pt-0">
      <q-card-section class="flex items-center gap-2">
        <div class="text-xl">植物管理</div>
        <q-space></q-space>
        <q-btn unelevated color="secondary" @click="toCreate">新增植物</q-btn>
      </q-card-section>
      <q-card-section ref="containerRef" class="grid grid-cols-2 gap-4 sm:grid-cols-6">
        <q-resize-observer @resize="onResize"></q-resize-observer>

        <my-edit-card v-for="item in items" :key="item._id" :menu="menu" @menu-click="(fn) => fn(item)">
          <div class="bg-brown-11 flex-center flex" :style="{ height: ((cardWidth - 2) * 3) / 4 + 'px' }">
            <q-img
              v-if="item.Images.length > 0"
              :src="getImageSrc(item.Images[0])"
              :ratio="4 / 3"
              :width="item.Images[0].Width + 'px'"
            ></q-img>
            <div v-else class="flex-center flex h-full text-black">No Image</div>
          </div>
          <q-card-section>
            <div class="overflow-hidden text-ellipsis whitespace-nowrap" :title="item.BusinessName">
              {{ item.BusinessName }}
            </div>
            <div class="overflow-hidden text-ellipsis whitespace-nowrap" :title="item.ScientificName">
              {{ item.ScientificName }}
            </div>
            <div>
              {{ item.Description }}
            </div>
          </q-card-section>
        </my-edit-card>
      </q-card-section>
      <q-card-section class="flex-center flex">
        <q-pagination
          v-model="pagination.page"
          :max="Math.ceil(pagination.count / pagination.itemPerPage)"
          direction-links
          boundary-links
          unelevated
          icon-first="skip_previous"
          icon-last="skip_next"
          icon-prev="fast_rewind"
          icon-next="fast_forward"
          @update:model-value="GetPlant"
        ></q-pagination>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useQuasar } from 'quasar'
import setSearchQuery from 'utils/setSearchQuery.js'
import { getPlant } from 'api'
import { QSelectProps, QInputProps, QBtnProps } from 'utils/quasar/base-props.js'
import PlantEdit from './components/PlantEdit.vue'
import { cloneDeep } from 'lodash-es'
import { useList } from 'utils/use-list'

const containerRef = ref()
const $q = useQuasar()

const menu = [
  { label: '編輯', icon: 'edit', fn: (item) => toEdit(item) },
  { label: '刪除', icon: 'delete', fn: (item) => toDelete(item) },
]

const loading = ref(false)
const items = ref([])
const GetPlant = async () => {
  loading.value = true

  const query = setSearchQuery({
    limit: pagination.itemPerPage,
    skip: (pagination.page - 1) * pagination.itemPerPage,
    ...search,
  })

  const { data } = await getPlant(query)

  if (data) {
    items.value = data.Items
    pagination.count = data.Count
  }

  loading.value = false
}

const pagination = reactive({
  page: 1,
  itemPerPage: 24,
  count: 0,
})

const initData = {}
initData.search = {
  Family: null,
  Genus: null,
  ScientificName: null,
  BusinessName: null,
}
const search = reactive(cloneDeep(initData.search))

const searchSubmit = () => {
  GetPlant()
}

const searchClear = () => {
  Object.assign(search, cloneDeep(initData.search))
  GetPlant()
}

const toCreate = () => {
  $q.dialog({
    component: PlantEdit,
    componentProps: {
      editType: 'add',
    },
  }).onOk(() => {
    pagination.page = 1
    searchSubmit()
  })
}

const toEdit = (item) => {
  $q.dialog({
    component: PlantEdit,
    componentProps: {
      editType: 'edit',
      data: item,
    },
  }).onOk(() => {
    searchSubmit()
  })
}

const toDelete = (item) => {
  $q.dialog({
    component: PlantEdit,
    componentProps: {
      editType: 'delete',
      data: item,
    },
  }).onOk(() => {
    const prePage = pagination.page - 1
    if (prePage > 0) {
      if (pagination.count - 1 <= prePage * pagination.itemPerPage) pagination.page = prePage
    }
    searchSubmit()
  })
}

const listKeys = ['TaxonomyFamily', 'TaxonomyGenus']
const { TaxonomyFamily: taxonomyFamilyItems, TaxonomyGenus: taxonomyGenusItems } = useList(listKeys)

const containerSize = ref()
const onResize = (size) => {
  containerSize.value = size
}

const cardWidth = computed(() => {
  const gapWidth = 16
  const padding = 32
  switch ($q.screen.name) {
    case 'xs':
      return (containerSize.value.width - gapWidth - padding) / 2
    default:
      return (containerSize.value.width - 5 * gapWidth - padding) / 6
  }
})

const getImageSrc = (image) => {
  return image && image.Thumb.BasePath
    ? `https://firebasestorage.googleapis.com/v0/b/mrgreen-dbf25.appspot.com/o/${image.Thumb.BasePath}?alt=media`
    : null
}

const init = () => {
  GetPlant()
}
init()
</script>

