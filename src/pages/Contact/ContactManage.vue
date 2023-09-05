<template>
  <q-page class="p-4">
    <my-search-area @searchSubmit="searchSubmit" @searchClear="searchClear">
      <q-input v-bind="QInputProps" v-model="search.Name" label="名稱" @keydown.enter="searchSubmit"></q-input>
    </my-search-area>

    <q-table
      class="mt-2"
      v-bind="QTableProps"
      :rows="rows"
      :columns="columns"
      :loading="loading"
      row-key="_id"
      :pagination="pagination"
    >
      <template #top>
        <div class="text-xl">聯絡人管理</div>
        <q-space></q-space>
        <q-btn v-bind="QBtnProps" color="secondary" @click="toCreate">新增</q-btn>
      </template>
      <template #body="props">
        <my-edit-row :props="props" :menu="menu" @menu-click="(fn) => fn(props.row)"></my-edit-row>
      </template>

      <template #bottom>
        <div class="flex-center flex w-full gap-4">
          <q-pagination
            v-bind="QPaginationProps"
            v-model="pagination.page"
            :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
            @update:model-value="GetContact"
          ></q-pagination>
          <div>共 {{ pagination.rowsNumber }} 筆</div>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import ContactEdit from './components/ContactEdit.vue'
import { getContact } from 'api'
import setSearchQuery from 'utils/setSearchQuery'
import { cloneDeep } from 'lodash-es'
import { QInputProps, QTableProps, QBtnProps, QPaginationProps } from 'utils/quasar/base-props'

const $q = useQuasar()

const menu = [
  { label: '編輯', icon: 'edit', fn: (item) => toEdit(item) },
  { label: '刪除', icon: 'delete', fn: (item) => toDelete(item) },
]

const columns = [
  { name: 'Name', label: '聯絡人名稱', field: 'Name', align: 'left' },
  { name: 'Address', label: '地址', field: 'Address', align: 'left' },
  { name: 'Phone', label: '電話', field: 'Phone', align: 'left' },
  { name: 'Website', label: '網頁', field: 'Website', align: 'left' },
  { name: 'Remark', label: '備註', field: 'Remark', align: 'left' },
]

const loading = ref(false)
const rows = ref([])
const GetContact = async () => {
  loading.value = true

  const query = setSearchQuery({
    limit: pagination.rowsPerPage,
    skip: skip.value,
    ...search,
  })

  const { data } = await getContact(query)

  if (data) {
    rows.value = data.Items
    pagination.rowsNumber = data.Count
  }

  loading.value = false
}

const skip = computed(() => (pagination.page - 1) * pagination.rowsPerPage)

const pagination = reactive({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const initData = {}
initData.search = {
  Type: null,
  Name: null,
}
const search = reactive(cloneDeep(initData.search))

const searchSubmit = () => {
  pagination.page = 1
  GetContact()
}

const searchClear = () => {
  Object.assign(search, initData.search)
  filterItem.value = {}
  GetContact()
}

const toCreate = () => {
  $q.dialog({
    component: ContactEdit,
    componentProps: {
      editType: 'add',
    },
  }).onOk(() => {
    searchSubmit()
  })
}

const toEdit = (item) => {
  $q.dialog({
    component: ContactEdit,
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
    component: ContactEdit,
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
  GetContact()
}
init()
</script>

