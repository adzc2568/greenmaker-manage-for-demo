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
          <div class="q-table__title">進貨單管理</div>
          <q-space></q-space>
          <q-btn v-bind="QBtnProps" color="secondary" @click="toCreate">新增</q-btn>
        </div>
      </template>
      <template #body="props">
        <my-edit-row :props="props" :menu="menu" @menu-click="(fn) => fn(props.row)">
          <template #body-cell-Details="{ col, value }">
            <q-td :col="col">
              <div class="grid gap-2">
                <q-card v-for="detail in value" :key="detail.WarehouseId" bordered flat>
                  <q-card-section>
                    <div class="flex">
                      <div>項目名稱：</div>
                      <div>{{ detail.WarehouseName }}</div>
                    </div>
                    <div class="flex">
                      <div>規格：</div>
                      <div>{{ detail.SkuName }}</div>
                    </div>
                    <div class="flex">
                      <div>聯絡人：</div>
                      <div>{{ detail.ContactName }}</div>
                    </div>
                    <div class="flex">
                      <div>價格：</div>
                      <div>{{ detail.Price }}</div>
                    </div>
                    <div class="flex">
                      <div>數量：</div>
                      <div>{{ detail.Amount }}</div>
                    </div>
                    <div class="flex">
                      <div>備註：</div>
                      <div>{{ detail.Remark }}</div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </q-td>
          </template>
        </my-edit-row>
      </template>

      <template #bottom>
        <div class="flex-center flex w-full gap-4">
          <q-pagination
            v-bind="QPaginationProps"
            v-model="pagination.page"
            :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
            @update:model-value="GetPurchaseOrder"
          ></q-pagination>
          <div>共 {{ pagination.rowsNumber }} 筆</div>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import PurchaseOrderEdit from './components/PurchaseOrderEdit.vue'
import { getPurchaseOrder } from 'api'
import setSearchQuery from 'utils/setSearchQuery'
import { cloneDeep } from 'lodash-es'
import { QInputProps, QTableProps, QBtnProps, QPaginationProps } from 'utils/quasar/base-props'

const $q = useQuasar()

const menu = [
  { label: '編輯', icon: 'edit', fn: (item) => toEdit(item) },
  { label: '刪除', icon: 'delete', fn: (item) => toDelete(item) },
]

const columns = [
  { name: 'PurchaseDate', label: '進貨日期', field: (row) => row.PurchaseDate?.substring(0, 10), align: 'left' },
  { name: 'Details', label: '進貨明細', field: 'Details', align: 'left' },
  { name: 'TotalPrice', label: '總金額', field: 'TotalPrice', align: 'right' },
  { name: 'Remark', label: '備註', field: 'Remark', align: 'left' },
]

const loading = ref(false)
const rows = ref([])
const GetPurchaseOrder = async () => {
  loading.value = true

  const query = setSearchQuery({
    limit: pagination.rowsPerPage,
    skip: (pagination.page - 1) * pagination.rowsPerPage,
    ...search,
  })

  const { data } = await getPurchaseOrder(query)

  if (data) {
    rows.value = data.Items
    pagination.rowsNumber = data.Count
  }

  loading.value = false
}

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
  GetPurchaseOrder()
}

const searchClear = () => {
  Object.assign(search, cloneDeep(initData.search))
  pagination.page = 1
  GetPurchaseOrder()
}

const toCreate = () => {
  $q.dialog({
    component: PurchaseOrderEdit,
    componentProps: {
      editType: 'add',
    },
  }).onOk(() => {
    searchSubmit()
  })
}

const toEdit = (item) => {
  $q.dialog({
    component: PurchaseOrderEdit,
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
    component: PurchaseOrderEdit,
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
  GetPurchaseOrder()
}
init()
</script>

