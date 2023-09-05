<template>
  <my-wrapper :wrapper-type="wrapperType">
    <my-search-area @search-submit="searchSubmit" @search-clear="searchClear">
      <q-input v-bind="QInputProps" v-model="search.Id" :label="`${title}代碼`"></q-input>
      <q-input v-bind="QInputProps" v-model="search.Name" :label="`${title}名稱`"></q-input>
    </my-search-area>

    <q-card flat bordered class="mt-2 [&>.q-card\_\_section:not(:first-child)]:pt-0">
      <q-card-section class="flex items-center">
        <div class="text-xl">{{ title }}管理</div>
        <q-space></q-space>
        <q-btn v-bind="QBtnProps" color="secondary" @click="toAdd">新增</q-btn>
      </q-card-section>
      <q-card-section v-if="items.length === 0">
        <q-icon name="warning" class="mr-4" size="sm"></q-icon>
        <span class="text-xs">沒有資料</span>
      </q-card-section>
      <q-card-section v-else class="grid grid-cols-2 gap-2 sm:grid-cols-6">
        <my-edit-card v-for="(item, index) in items" :key="item._id" :menu="menu" @menu-click="(fn) => fn(item, index)">
          <q-card-section>
            <div class="text-xs">{{ item.Id }}</div>
            <div class="text-sm">{{ item.Name }}</div>
          </q-card-section>
        </my-edit-card>
      </q-card-section>
      <q-card-section class="flex-center flex">
        <q-pagination
          v-bind="QPaginationProps"
          v-model="pagination.page"
          :max="Math.ceil(pagination.count / pagination.itemPerPage)"
          @update:model-value="GetCommonData"
        ></q-pagination>
      </q-card-section>
    </q-card>
  </my-wrapper>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import CommonDataEdit from 'components/CommonDataEdit.vue'
import { getCommonData } from 'api'
import setSearchQuery from 'utils/setSearchQuery'
import { cloneDeep } from 'lodash-es'
import { QInputProps, QBtnProps, QPaginationProps } from 'utils/quasar/base-props.js'

const props = defineProps({
  wrapperType: {
    type: String,
    default: 'q-page',
  },
  title: String,
  category: String,
})

const $q = useQuasar()

const menu = [
  { label: '編輯', icon: 'edit', fn: (item) => toEdit(item) },
  { label: '刪除', icon: 'delete', fn: (item) => toDelete(item) },
]

const loading = ref(false)
const items = ref([])
const GetCommonData = async () => {
  loading.value = true

  const query = setSearchQuery({
    limit: pagination.itemPerPage,
    skip: (pagination.page - 1) * pagination.itemPerPage,
    Category: props.category,
    Id: search.Id ? `*${search.Id}*` : null,
    Name: search.Name ? `*${search.Name}*` : null,
  })

  const { data } = await getCommonData(query)

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
  Id: null,
  Name: null,
}
const search = reactive(cloneDeep(initData.search))

const searchSubmit = () => {
  GetCommonData()
}

const searchClear = () => {
  Object.assign(search, cloneDeep(initData.search))
  GetCommonData()
}

const toAdd = () => {
  $q.dialog({
    component: CommonDataEdit,
    componentProps: {
      editType: 'add',
      category: props.category,
      title: props.title,
    },
  }).onOk(() => {
    pagination.page = 1
    searchSubmit()
  })
}

const toEdit = (item) => {
  $q.dialog({
    component: CommonDataEdit,
    componentProps: {
      editType: 'edit',
      category: props.category,
      title: props.title,
      data: item,
    },
  }).onOk(() => {
    searchSubmit()
  })
}

const toDelete = (item) => {
  $q.dialog({
    component: CommonDataEdit,
    componentProps: {
      editType: 'delete',
      category: props.category,
      title: props.title,
      data: item,
    },
  }).onOk(() => {
    const prePage = pagination.page - 1
    if (prePage > 0 && pagination.count - 1 <= prePage * pagination.itemPerPage) {
      pagination.page = prePage
    }
    searchSubmit()
  })
}

const init = () => {
  GetCommonData()
}
init()
</script>

