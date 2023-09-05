<template>
  <q-dialog ref="dialogRef" full-width no-backdrop-dismiss>
    <my-dialog-content :header="header" @close="onDialogCancel">
      <div class="grid grid-cols-12 gap-2">
        <my-date-input
          class="col-span-6"
          v-bind="QInputProps"
          :ref="(el) => (inputRefs.PurchaseDate = el)"
          :rules="rules.PurchaseDate"
          v-model="editItem.PurchaseDate"
          label="進貨日期"
          :readonly="editType === 'delete'"
        ></my-date-input>

        <q-table
          class="col-span-full"
          v-bind="QTableProps"
          :columns="detailsColumns"
          :rows="editItem.Details"
          :pagination="{ rowsPerPage: -1 }"
        >
          <template v-if="editType !== 'delete'" #top>
            <q-space></q-space>
            <q-btn v-bind="QBtnProps" color="secondary" icon="add" @click="addDetailsRow"></q-btn>
          </template>
          <template #body-cell-WarehouseId="{ col, row }">
            <q-td :props="{ col }">
              <my-filter-select
                v-bind="QSelectProps"
                v-model="row.WarehouseId"
                :filter-keys="warehouseFilterKeys"
                :options="warehouseItems"
                option-label="Name"
                option-value="_id"
                :emit-value="false"
                @clear="onWarehouseClear(row)"
                @update:model-value="(val) => (val ? onWarehouseSelect(val, row) : null)"
                :readonly="editType === 'delete'"
              >
              </my-filter-select>
            </q-td>
          </template>
          <template #body-cell-SkuId="{ col, row }">
            <q-td :props="{ col }">
              <q-select
                v-bind="QSelectProps"
                v-model="row.SkuId"
                :options="row.Skus"
                :option-label="(opt) => (opt.SkuOptions ? getSkuName(opt.SkuOptions, true) : null)"
                option-value="_id"
                map-options
                @clear="onSkuClear(row)"
                @update:model-value="(val) => (val ? onSkuSelect(val, row) : null)"
                :readonly="editType === 'delete'"
              >
              </q-select>
            </q-td>
          </template>
          <template #body-cell-ContactId="{ col, row }">
            <q-td :props="{ col }">
              <my-filter-select
                v-bind="QSelectProps"
                v-model="row.ContactId"
                :filter-keys="contactFilterKeys"
                :options="contactItems"
                option-label="Name"
                option-value="_id"
                :emit-value="false"
                @clear="onContactClear(row)"
                @update:model-value="(val) => (val ? onContactSelect(val, row) : null)"
                :readonly="editType === 'delete'"
              >
              </my-filter-select>
            </q-td>
          </template>
          <template #body-cell-Price="{ col, row }">
            <q-td :props="{ col }">
              <q-input
                v-bind="QInputProps"
                v-model="row.Price"
                type="number"
                min="0"
                :readonly="editType === 'delete'"
                @update:model-value="onPriceAndAmountUpdate"
              ></q-input>
            </q-td>
          </template>
          <template #body-cell-Amount="{ col, row }">
            <q-td :props="{ col }">
              <q-input
                v-bind="QInputProps"
                v-model="row.Amount"
                type="number"
                min="0"
                :readonly="editType === 'delete'"
                @update:model-value="onPriceAndAmountUpdate"
              ></q-input>
            </q-td>
          </template>
          <template #body-cell-Remark="{ col, row }">
            <q-td :props="{ col }">
              <q-input v-bind="QInputProps" v-model="row.Remark" :readonly="editType === 'delete'"></q-input>
            </q-td>
          </template>
          <template #body-cell-action="{ col, rowIndex }">
            <q-td :props="{ col }">
              <q-btn v-bind="QBtnProps" @click="deleteDetailsRow(rowIndex)" icon="delete" round></q-btn>
            </q-td>
          </template>

          <template #bottom>
            <q-space></q-space>
            <q-input v-bind="QInputProps" v-model="editItem.TotalPrice" label="總金額"></q-input>
          </template>
        </q-table>

        <q-input
          class="col-span-full"
          v-bind="QInputProps"
          :ref="(el) => (inputRefs.Remark = el)"
          :rules="rules.Remark"
          v-model="editItem.Remark"
          type="textarea"
          label="備註"
          :readonly="editType === 'delete'"
        ></q-input>
      </div>

      <template #actions>
        <q-btn unelevated color="grey" label="取消" @click="onDialogCancel" />
        <q-btn v-if="editType === 'add'" unelevated color="secondary" label="新增" @click="onSaveClick" />
        <q-btn v-if="editType === 'edit'" unelevated color="primary" label="儲存" @click="onSaveClick" />
        <q-btn v-if="editType === 'delete'" unelevated color="negative" label="刪除" @click="onDeleteClick" />
      </template>
    </my-dialog-content>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useQuasar, useDialogPluginComponent } from 'quasar'
import { validate } from 'utils/quasar/validate.js'
import { required } from 'utils/quasar/rules.js'
import { QInputProps, QSelectProps, QTableProps, QBtnProps } from 'utils/quasar/base-props'
import { cloneDeep, sum } from 'lodash-es'
import { getWarehouse, getContact, postPurchaseOrderItem, putPurchaseOrderItem, deletePurchaseOrderItem } from 'api'
import { getSkuName } from 'utils/skus.js'

const $q = useQuasar()
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  editType: String,
  data: {
    type: Object,
    default: () => ({
      PurchaseDate: null,
      Details: [],
      TotalPrice: null,
      Remark: null,
    }),
  },
})

const initData = {}
initData.detail = {
  WarehouseId: null,
  WarehouseName: null,
  SkuId: null,
  SkuName: null,
  ContactId: null,
  ContactName: null,
  Price: null,
  Amount: null,
  Remark: null,
}

const detailsColumns = [
  { name: 'WarehouseId', label: '倉儲品項', field: 'WarehouseId', align: 'left' },
  { name: 'SkuId', label: '規格', field: 'SkuId', align: 'left' },
  { name: 'ContactId', label: '廠商', field: 'ContactId', align: 'left' },
  { name: 'Price', label: '價格', field: 'Price', align: 'left' },
  { name: 'Amount', label: '數量', field: 'Amount', align: 'left' },
  { name: 'Remark', label: '備註', field: 'Remark', align: 'left' },
  { name: 'action', field: 'action', align: 'left' },
]

const addDetailsRow = () => {
  editItem.Details.push(cloneDeep(initData.detail))
}

const editItem = reactive(cloneDeep(props.data))

const header = computed(() => {
  switch (props.editType) {
    case 'add':
      return '新增倉儲項目'
    case 'edit':
      return '編輯倉儲項目'
    case 'delete':
      return '刪除倉儲項目'
    default:
      return null
  }
})

const inputRefs = reactive({})
const rules = {
  Type: required({ label: '類型', type: 'input' }),
  Name: required({ label: '名稱', type: 'input' }),
}

const callApi = async (param) => {
  const api = {
    add: postPurchaseOrderItem,
    edit: putPurchaseOrderItem,
    delete: deletePurchaseOrderItem,
  }

  const { error } = await api[props.editType](param)

  $q.notify({
    type: error ? 'negative' : 'positive',
    message: header.value + (error ? '失敗' : '成功'),
    position: 'top',
  })

  if (!error) onDialogOK()
}

const onSaveClick = () => {
  const { result, errorInputRef } = validate(inputRefs)

  if (!result) {
    errorInputRef.focus()
    return
  }

  callApi(editItem)
}

const onDeleteClick = () => {
  callApi(editItem._id)
}

const warehouseItems = ref([])
const warehouseFilterKeys = ['Name']
const GetWarehouse = async () => {
  const { data } = await getWarehouse()
  if (data) warehouseItems.value = data.Items
}

const onWarehouseSelect = (opt, row) => {
  row.WarehouseId = opt._id
  row.WarehouseName = opt.Name
  row.Skus = opt.Skus
  if (opt.Options.length === 0) {
    onSkuSelect(opt.Skus[0], row)
  }
}

const onWarehouseClear = (row) => {
  row.WarehouseName = null
  row.Skus = []
}

const onSkuSelect = (opt, row) => {
  row.SkuId = opt._id
  row.SkuName = getSkuName(opt.SkuOptions, true)
}

const onSkuClear = (row) => {
  row.SkuName = null
}

const contactItems = ref([])
const contactFilterKeys = ['Name']
const GetContact = async () => {
  const { data } = await getContact()
  if (data) contactItems.value = data.Items
}

const onContactSelect = (opt, row) => {
  row.ContactId = opt._id
  row.ContactName = opt.Name
}

const onContactClear = (row) => {
  row.ContactName = null
}

const onPriceAndAmountUpdate = () => {
  editItem.TotalPrice = sum(editItem.Details.map(({ Price, Amount }) => Price * Amount))
}

const deleteDetailsRow = (rowIndex) => {
  editItem.Details.splice(rowIndex, 1)
  onPriceAndAmountUpdate()
}

const init = async () => {
  await GetWarehouse()
  GetContact()

  if (editItem.Details.length === 0) addDetailsRow()
  if (props.editType !== 'add') {
    editItem.Details.forEach((item) => {
      item.Skus = warehouseItems.value.find(({ _id }) => _id === item.WarehouseId)?.Skus || []
    })
  }
}
init()
</script>

