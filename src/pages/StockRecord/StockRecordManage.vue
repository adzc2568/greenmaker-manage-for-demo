<template>
  <q-page class="q-pa-md">
    <q-table
      v-bind="QTableProps"
      :rows="rows"
      :columns="columns"
      :loading="loading"
      row-key="_id"
      :pagination="pagination"
    >
      <template #top>
        <my-search-area @searchSubmit="searchSubmit" @searchClear="searchClear">
          <q-input v-bind="QInputProps" v-model="search.Name" label="名稱" @keydown.enter="searchSubmit"></q-input>
        </my-search-area>
        <div class="flex w-full items-center">
          <div class="q-table__title">庫存紀錄管理</div>
        </div>
      </template>

      <template #bottom>
        <div class="flex-center flex w-full gap-4">
          <q-pagination
            v-bind="QPaginationProps"
            v-model="pagination.page"
            :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
            @update:model-value="GetStockRecord"
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
import { getStockRecord } from 'api'
import setSearchQuery from 'utils/setSearchQuery'
import { cloneDeep } from 'lodash-es'
import { QInputProps, QTableProps, QPaginationProps } from 'utils/quasar/base-props'
import dayjs from 'dayjs'

const $q = useQuasar()

const columns = [
  { name: 'Type', label: '紀錄類型', field: 'Type', align: 'left' },
  {
    name: 'RecordDate',
    label: '紀錄時間',
    field: (row) => dayjs(row.RecordDate).format('YYYY-MM-DD HH:mm:ss'),
    align: 'left',
  },
  {
    name: 'Detail',
    label: '庫存變更紀錄',
    field: (row) => JSON.stringify(row.Detail, null, 4),
    align: 'left',
    classes: 'whitespace-pre',
  },
]

const loading = ref(false)
const rows = ref([])
const GetStockRecord = async () => {
  loading.value = true

  const query = setSearchQuery({
    limit: pagination.rowsPerPage,
    skip: skip.value,
    ...search,
  })

  const { data } = await getStockRecord(query)

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
  GetStockRecord()
}

const searchClear = () => {
  Object.assign(search, initData.search)
  pagination.page = 1
  GetStockRecord()
}

const init = () => {
  GetStockRecord()
}
init()
</script>

