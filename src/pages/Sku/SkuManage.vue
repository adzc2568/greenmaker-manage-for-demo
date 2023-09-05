<template>
  <q-page class="p-4">
    <my-search-area @searchSubmit="searchSubmit" @searchClear="searchClear">
      <q-input v-bind="QInputProps" v-model="search.SkuName" label="規格名稱" @keydown.enter="searchSubmit"></q-input>
    </my-search-area>

    <q-card flat bordered class="mt-2 [&>.q-card\_\_section:not(:first-child)]:pt-0">
      <q-card-section class="flex items-center gap-2">
        <div class="text-xl">規格管理</div>
        <q-space></q-space>
        <q-btn unelevated color="secondary" @click="toCreate">新增規格</q-btn>
      </q-card-section>
      <q-card-section ref="containerRef" class="grid grid-cols-2 gap-4 sm:grid-cols-6">
        <q-resize-observer @resize="onResize"></q-resize-observer>

        <my-edit-card v-for="item in items" :key="item._id" :menu="menu" @menu-click="(fn) => fn(item)">
          <q-card-section> {{ item.SkuName }} </q-card-section>
        </my-edit-card>
      </q-card-section>
      <q-card-section class="flex-center flex">
        <q-pagination
          v-bind="QPaginationProps"
          v-model="pagination.page"
          :max="Math.ceil(pagination.count / pagination.itemPerPage)"
          @update:model-value="GetSku"
        ></q-pagination>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import setSearchQuery from 'utils/setSearchQuery.js'
import { getSku } from 'api'
import { QInputProps, QPaginationProps } from 'utils/quasar/base-props.js'
import SkuEdit from './components/SkuEdit.vue'
import { cloneDeep } from 'lodash-es'

const containerRef = ref()
const $q = useQuasar()

const menu = [
  { label: '編輯', icon: 'edit', fn: (item) => toEdit(item) },
  { label: '刪除', icon: 'delete', fn: (item) => toDelete(item) },
]

const loading = ref(false)
const items = ref([])
const GetSku = async () => {
  loading.value = true

  const query = setSearchQuery({
    limit: pagination.itemPerPage,
    skip: (pagination.page - 1) * pagination.itemPerPage,
    SkuName: search.SkuName ? `*${search.SkuName}*` : null,
  })

  const { data } = await getSku(query)

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
  SkuName: null,
}
const search = reactive(cloneDeep(initData.search))

const searchSubmit = () => {
  GetSku()
}

const searchClear = () => {
  Object.assign(search, cloneDeep(initData.search))
  GetSku()
}

const toCreate = () => {
  $q.dialog({
    component: SkuEdit,
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
    component: SkuEdit,
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
    component: SkuEdit,
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

const init = () => {
  GetSku()
}
init()
</script>

