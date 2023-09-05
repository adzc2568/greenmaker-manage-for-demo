<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-2">
        <q-select
          v-bind="QSelectProps"
          :model-value="commodity.TypeId"
          :options="typeItems"
          option-label="Name"
          option-value="Id"
          emit-value
          map-options
          label="分類"
          readonly
        ></q-select>
      </div>
      <div class="col-5">
        <q-input v-bind="QInputProps" :model-value="commodity.Title" label="標題" readonly></q-input>
      </div>
      <div class="col-5">
        <q-input v-bind="QInputProps" :model-value="commodity.UrlTitle" label="Url Title" readonly></q-input>
      </div>
      <div class="col-12">
        <q-select
          v-bind="QSelectProps"
          :model-value="commodity.TagIds"
          label="標籤"
          :options="tagFilterItems"
          option-label="Name"
          option-value="Id"
          map-options
          emit-value
          use-chips
          multiple
          use-input
          readonly
        ></q-select>
      </div>

      <div class="col-12">
        <q-table
          v-bind="QTableProps"
          :columns="skusColumns"
          :rows="commodity.SKUs"
          row-key="_id"
          @row-contextmenu="contextmenuHandler"
          v-model:selected="selected"
          :pagination="{ rowsPerPage: -1 }"
        >
          <template #body-cell-action>
            <q-btn v-bind="QBtnProps" label="變更庫存"></q-btn>
          </template>
        </q-table>

        <q-menu v-model="menuModel" touch-position context-menu target="tbody" @hide="onMenuHide">
          <q-list dense style="min-width: 100px">
            <q-item
              v-for="(item, index) in menu"
              :key="index"
              clickable
              v-close-popup
              @click="menuEventHandler(item.key)"
            >
              <q-item-section>{{ item.text }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getCommodityItem, getCommonList } from 'api'
import { QInputProps, QSelectProps, QTableProps, QBtnProps } from 'utils/quasar/base-props'
import { useFilter } from 'utils/quasar/use-filter'
import StockUpdate from './components/StockUpdate.vue'

const $q = useQuasar()
const route = useRoute()

/* table 右鍵 */
const menuModel = ref(false)
const menu = computed(() => {
  return [{ text: '庫存變更', key: 'edit' }]
})

const menuEventHandler = (key) => {
  switch (key) {
    case 'edit': {
      toStockUpdate(selected.value[0])
      break
    }
  }
}

const selected = ref([]) // 右鍵選擇的 Item

const onMenuHide = () => {
  selected.value = []
}

const contextmenuHandler = async (evt, row) => {
  evt.preventDefault()
  selected.value = [row]
}

const loading = ref(false)

const skusColumns = [
  { name: 'Options', label: '規格', field: 'Options', align: 'left' },
  { name: 'Price', label: '價格', field: 'Price', align: 'left' },
  { name: 'Stock', label: '庫存', field: 'Stock', align: 'left' },
  { name: 'IsLaunched', label: '是否販售', field: 'IsLaunched', align: 'left' },
]

const commodity = reactive({
  TypeId: null,
  Title: null,
  UrlTitle: null,
  TagIds: [],
  Options: [],
  SKUs: [],
})
const GetCommodityItem = async () => {
  const { data, error } = await getCommodityItem(route.params._id)
  if (error)
    $q.notify({
      message: '取得商品資料失敗',
      position: 'top',
      type: 'negative',
    })
  if (data) Object.assign(commodity, data)
}

const typeItems = ref([])
const GetCommodityType = async () => {
  const { data } = await getCommonList('CommodityType')
  if (data) typeItems.value = data
}

const tagItems = ref([])
const GetCommodityTag = async () => {
  const { data } = await getCommonList('Tag')
  if (data) tagItems.value = data
}

const toStockUpdate = (row) => {
  const dialog = $q
    .dialog({
      component: StockUpdate,
      componentProps: {
        data: row,
      },
    })
    .onOk(async (editItem) => {})
}

const init = () => {
  GetCommodityItem()
  GetCommodityType()
  GetCommodityTag()
}
init()
</script>

