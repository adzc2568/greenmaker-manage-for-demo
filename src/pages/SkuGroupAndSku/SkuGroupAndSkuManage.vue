<template>
  <q-page class="p-4">
    <my-search-area @searchSubmit="searchSubmit" @searchClear="searchClear">
      <q-input
        v-bind="QInputProps"
        v-model="search.SkuGroupName"
        label="規格群組名稱"
        @keydown.enter="searchSubmit"
      ></q-input>
    </my-search-area>

    <q-card flat bordered class="mt-2 [&>.q-card\_\_section:not(:first-child)]:pt-0">
      <q-card-section class="flex items-center gap-2">
        <div class="text-xl">規格群組管理</div>
        <q-space></q-space>
        <q-btn unelevated color="secondary" @click="toCreate">新增規格群組</q-btn>
      </q-card-section>
      <q-card-section ref="containerRef" class="grid grid-cols-2 gap-4 sm:grid-cols-6">
        <q-resize-observer @resize="onResize"></q-resize-observer>

        <my-edit-card v-for="item in items" :key="item._id" :menu="menu" @menu-click="(fn) => fn(item)">
          <q-card-section>
            <div>{{ item.SkuGroupName }}</div>
            <div>{{ item.Skus }}</div>
          </q-card-section>
        </my-edit-card>
      </q-card-section>
      <q-card-section class="flex-center flex">
        <q-pagination
          v-bind="QPaginationProps"
          v-model="pagination.page"
          :max="Math.ceil(pagination.count / pagination.itemPerPage)"
          @update:model-value="GetSkuGroup"
        ></q-pagination>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import setSearchQuery from 'utils/setSearchQuery.js'
import { getSkuGroup } from 'api'
import { QInputProps, QPaginationProps } from 'utils/quasar/base-props.js'
import SkuGroupAndSkuEdit from './components/SkuGroupAndSkuEdit.vue'
import { cloneDeep } from 'lodash-es'

const containerRef = ref()
const $q = useQuasar()

const menu = [
  { label: '編輯', icon: 'edit', fn: (item) => toEdit(item) },
  { label: '刪除', icon: 'delete', fn: (item) => toDelete(item) },
]

const loading = ref(false)
const items = ref([])
const GetSkuGroup = async () => {
  loading.value = true

  const query = setSearchQuery({
    limit: pagination.itemPerPage,
    skip: (pagination.page - 1) * pagination.itemPerPage,
    SkuGroupName: search.SkuGroupName ? `*${search.SkuGroupName}*` : null,
  })

  const { data } = await getSkuGroup(query)

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
  SkuGroupName: null,
}
const search = reactive(cloneDeep(initData.search))

const searchSubmit = () => {
  GetSkuGroup()
}

const searchClear = () => {
  Object.assign(search, cloneDeep(initData.search))
  GetSkuGroup()
}

const toCreate = () => {
  $q.dialog({
    component: SkuGroupAndSkuEdit,
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
    component: SkuGroupAndSkuEdit,
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
    component: SkuGroupAndSkuEdit,
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
  GetSkuGroup()
}
init()
/*
*/
</script>

