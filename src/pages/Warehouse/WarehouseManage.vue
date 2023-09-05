<template>
  <q-page class="p-4">
    <my-search-area @searchSubmit="searchSubmit" @searchClear="searchClear">
      <my-filter-select
        v-bind="QSelectProps"
        v-model="search.TypeId"
        label="類型"
        list-key="WarehouseType"
        @update:model-value="searchSubmit"
      >
      </my-filter-select>
      <q-input v-bind="QInputProps" v-model="search.Name" label="名稱" @keydown.enter="searchSubmit"></q-input>
    </my-search-area>

    <q-card flat bordered class="mt-2 [&>.q-card\_\_section:not(:first-child)]:pt-0">
      <q-card-section class="flex items-center gap-2">
        <div class="text-xl">倉儲管理</div>
        <q-space></q-space>
        <q-btn v-bind="QBtnProps" color="secondary" label="從植物匯入" @click="toSelectFromPlant"></q-btn>
        <q-btn v-bind="QBtnProps" color="secondary" label="庫存轉移" @click="toStockMove"></q-btn>
        <q-btn v-bind="QBtnProps" color="secondary" label="新增" @click="toCreate"></q-btn>
      </q-card-section>
      <q-card-section class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <my-edit-card
          v-for="(item, index) in items"
          :key="item._id"
          :menu="menu"
          @menu-click="(fn) => fn(item, index)"
        >
          <q-card-section>
            <div>{{ item.TypeName ? `[${item.TypeName}]` : '' }} {{ item.Name }}</div>
          </q-card-section>
          <q-card-section v-if="$q.screen.name !== 'xs'" class="grid gap-1 pt-0">
            <q-chip v-for="(sku, skuIndex) in item.Skus" :key="skuIndex" bordered flat>
              <div v-for="(skuOption, OptionIndex) in sku.SkuOptions" :key="OptionIndex" class="flex">
                <div>{{ skuOption.OptionValue }}：</div>
                <div>{{ sku.Stock }}</div>
              </div>
            </q-chip>
          </q-card-section>
          <q-card-section v-else> 總庫存：{{ sum(item.Skus.map(({ Stock }) => Stock)) }} </q-card-section>
        </my-edit-card>
      </q-card-section>
      <q-card-section class="flex-center flex">
        <q-pagination
          v-bind="QPaginationProps"
          v-model="pagination.page"
          :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
          @update:model-value="GetWarehouse"
        ></q-pagination>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import WarehouseEdit from './components/WarehouseEdit.vue'
import StockMove from './components/StockMove.vue'
import { getWarehouse } from 'api'
import setSearchQuery from 'utils/setSearchQuery'
import { cloneDeep, sum } from 'lodash-es'
import { QInputProps, QSelectProps, QBtnProps, QPaginationProps } from 'utils/quasar/base-props'
import SelectFromPlant from './components/SelectFromPlant.vue'

const $q = useQuasar()

const menu = [
  { label: '編輯', icon: 'edit', fn: (item) => toEdit(item) },
  { label: '刪除', icon: 'delete', fn: (item) => toDelete(item) },
  { label: '變更庫存', icon: 'post_add', fn: (item) => toStockUpdate(item) },
]

const loading = ref(false)
const items = ref([])
const GetWarehouse = async () => {
  loading.value = true

  const query = setSearchQuery({
    limit: pagination.rowsPerPage,
    skip: (pagination.page - 1) * pagination.rowsPerPage,
    TypeId: search.TypeId,
    Name: search.Name ? `*${search.Name}*` : null,
  })

  const { data } = await getWarehouse(query)

  if (data) {
    items.value = data.Items
    pagination.rowsNumber = data.Count
  }

  loading.value = false
}

const pagination = reactive({
  page: 1,
  rowsPerPage: 16,
  rowsNumber: 0,
})

const initData = {}
initData.search = {
  TypeId: null,
  Name: null,
}
const search = reactive(cloneDeep(initData.search))

const searchSubmit = () => {
  GetWarehouse()
}

const searchClear = () => {
  Object.assign(search, cloneDeep(initData.search))
  GetWarehouse()
}

const toCreate = () => {
  $q.dialog({
    component: WarehouseEdit,
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
    component: WarehouseEdit,
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
    component: WarehouseEdit,
    componentProps: {
      editType: 'delete',
      data: item,
    },
  }).onOk(() => {
    const prePage = pagination.page - 1
    if (prePage > 0) {
      if (pagination.rowsNumber - 1 <= prePage * pagination.rowsPerPage) pagination.page = prePage
    }
    searchSubmit()
  })
}

const toStockUpdate = (item) => {
  $q.dialog({
    component: WarehouseEdit,
    componentProps: {
      editType: 'stock-update',
      data: item,
    },
  }).onOk(() => {
    searchSubmit()
  })
}

const toStockMove = () => {
  $q.dialog({
    component: StockMove,
  }).onOk(() => {
    searchSubmit()
  })
}

const toSelectFromPlant = () => {
  $q.dialog({
    component: SelectFromPlant,
  }).onOk(() => {
    pagination.page = 1
    searchSubmit()
  })
}

const init = () => {
  GetWarehouse()
}
init()
</script>

