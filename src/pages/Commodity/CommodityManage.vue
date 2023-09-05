<template>
  <q-page class="q-pa-md">
    <my-search-area @searchSubmit="searchSubmit" @searchClear="searchClear">
      <my-filter-select
        v-bind="QSelectProps"
        v-model="search.Type"
        label="Type"
        list-key="CommodityType"
      ></my-filter-select>
      <q-input v-bind="QInputProps" v-model="search.Title" label="Title"></q-input>
      <my-filter-select
        v-bind="QSelectProps"
        v-model="search.Tags"
        label="Tags"
        list-key="Tag"
        multiple
      ></my-filter-select>
      <my-date-input v-bind="QInputProps" v-model="search.CreateDateStart" label="CreateDate-Start"></my-date-input>
      <my-date-input v-bind="QInputProps" v-model="search.CreateDateEnd" label="CreateDate-End"></my-date-input>
      <my-filter-select
        v-bind="QSelectProps"
        v-model="search.Status"
        label="Status"
        list-key="CommodityStatus"
        multiple
      ></my-filter-select>
    </my-search-area>

    <q-card flat bordered class="mt-2 [&>.q-card\_\_section:not(:first-child)]:pt-0">
      <q-card-section class="flex items-center gap-2">
        <div class="text-xl">商品列表</div>
        <q-space></q-space>
        <!-- <q-btn v-bind="QBtnProps" color="secondary" label="從植物匯入" @click="toSelectFromPlant"></q-btn>
        <q-btn v-bind="QBtnProps" color="secondary" label="庫存轉移" @click="toStockMove"></q-btn> -->
        <q-btn v-bind="QBtnProps" color="secondary" label="新增" @click="toCreate"></q-btn>
      </q-card-section>
      <q-card-section class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <my-edit-card
          v-for="(item, index) in items"
          :key="item._id"
          :menu="menu"
          @menu-click="(fn) => fn(item, index)"
          class="[&>.q-card\_\_section:not(:first-child)]:pt-0"
        >
          <q-card-section>
            <div>{{ item.TypeName ? `[${item.TypeName}]` : '' }} {{ item.Name }}</div>
          </q-card-section>
          <q-card-section v-if="$q.screen.name !== 'xs'" class="grid gap-2">
            <q-card v-for="(sku, skuIndex) in item.Skus" :key="skuIndex" bordered flat>
              <q-card-section>
                <div v-for="(skuOption, OptionIndex) in sku.SkuOptions" :key="OptionIndex" class="flex">
                  <div>{{ skuOption.OptionValue }}：</div>
                  <div>{{ sku.Stock }}</div>
                </div>
              </q-card-section>
            </q-card>
          </q-card-section>
          <q-card-section v-else> 總庫存：{{ sum(item.Skus.map(({ Stock }) => Stock)) }} </q-card-section>
        </my-edit-card>
      </q-card-section>
      <q-card-section class="flex-center flex">
        <q-pagination
          v-bind="QPaginationProps"
          v-model="pagination.page"
          :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
          @update:model-value="GetCommodity"
        ></q-pagination>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { getCommodity, putChangeCommodityStatus } from 'api'
import setSearchQuery from 'utils/setSearchQuery'
import { cloneDeep, sum } from 'lodash-es'
import { QInputProps, QSelectProps, QBtnProps, QPaginationProps } from 'utils/quasar/base-props'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

const menu = [
  { label: '編輯', icon: 'edit', fn: (item) => toEdit(item) },
  { label: '刪除', icon: 'delete', fn: (item) => toDelete(item) },
  { label: '變更庫存', icon: 'post_add', fn: (item) => toStockUpdate(item) },
]

const loading = ref(false)
const items = ref([])
const GetCommodity = async () => {
  loading.value = true

  const query = setSearchQuery({
    limit: pagination.rowsPerPage,
    skip: (pagination.page - 1) * pagination.rowsPerPage,
    ...search,
  })

  const { data } = await getCommodity(query)

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
  Type: null,
  Title: null,
  Tags: [],
  CreateDateStart: null,
  CreateDateEnd: null,
  Status: null,
}
const search = reactive(cloneDeep(initData.search))

const searchSubmit = () => {
  GetCommodity()
}

const searchClear = () => {
  Object.assign(search, initData.search)
  GetCommodity()
}

const toCreate = () => {
  router.push({
    name: 'CreateCommodity',
  })
}

const toStockManage = () => {
  router.push({
    name: 'StockManage',
    params: { _id: selected.value[0]._id },
  })
}

const PutChangeCommodityStatus = async (body) => {
  try {
    const res = await putChangeCommodityStatus(body)
    if (res.status === 200) {
      $q.notify({
        message: `狀態「${res.data.Status.Name}」變更成功`,
        position: 'top',
        type: 'positive',
      })
      GetCommodity()
    }
  } catch (err) {
    if (err.status === 401) await PutChangeCommodityStatus()
    else
      $q.notify({
        message: '狀態變更失敗',
        position: 'top',
        type: 'negative',
      })
  }
}

const init = () => {
  GetCommodity()
}
init()
</script>

