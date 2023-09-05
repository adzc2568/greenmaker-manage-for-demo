<template>
  <q-dialog ref="dialogRef" full-width full-height no-backdrop-dismiss>
    <my-dialog-content :header="header" @close="onDialogCancel">
      <q-table
        class="col-span-5"
        table-class="pb-4"
        v-bind="QTableProps"
        :columns="columns"
        :rows="editItem.StockMoveItems"
        :pagination="{ rowsPerPage: -1 }"
      >
        <template #top>
          <q-space></q-space>
          <q-btn v-bind="QBtnProps" color="secondary" icon="add" @click="addEditItemRow"></q-btn>
        </template>
        <template #body-cell-FromWarehouseId="{ col, row, rowIndex }">
          <q-td :props="{ col }">
            <q-select
              v-bind="QSelectProps"
              v-model="row.FromWarehouseId"
              :ref="(el) => (inputRefs[`FromWarehouseId-$${rowIndex}`] = el)"
              :rules="rules.FromWarehouseId"
              :options="warehouseItems"
              option-label="Name"
              option-value="_id"
              map-options
              @update:model-value="(val) => (val ? onWarehouseSelect(val, row, 'From') : onWarehouseClear(row, 'From'))"
            >
            </q-select>
          </q-td>
        </template>
        <template #body-cell-FromSkuId="{ col, row }">
          <q-td :props="{ col }">
            <q-select
              v-bind="QSelectProps"
              v-model="row.FromSkuId"
              :ref="(el) => (inputRefs[`FromSkuId-$${rowIndex}`] = el)"
              :rules="rules.FromSkuId"
              :options="row.FromSkus"
              :option-label="skuOptionsLabel"
              option-value="_id"
              map-options
              @update:model-value="(val) => (val ? onFromSkuOptionsSelect(val, row) : onFromSkuOptionsClear(row))"
            >
            </q-select>
          </q-td>
        </template>
        <template #body-cell-Amount="{ col, row }">
          <q-td :props="{ col }">
            <q-input
              v-bind="QInputProps"
              v-model="row.Amount"
              :ref="(el) => (inputRefs[`Amount-$${rowIndex}`] = el)"
              :rules="rules.Amount"
              type="number"
              :min="0"
              :max="row.FromStock"
            ></q-input>
          </q-td>
        </template>
        <template #body-cell-ToWarehouseId="{ col, row }">
          <q-td :props="{ col }">
            <q-select
              v-bind="QSelectProps"
              v-model="row.ToWarehouseId"
              :ref="(el) => (inputRefs[`ToWarehouseId-$${rowIndex}`] = el)"
              :rules="rules.ToWarehouseId"
              :options="warehouseItems"
              option-label="Name"
              option-value="_id"
              map-options
              @update:model-value="(val) => (val ? onWarehouseSelect(val, row, 'To') : onWarehouseClear(row, 'To'))"
            >
            </q-select>
          </q-td>
        </template>
        <template #body-cell-ToSkuId="{ col, row }">
          <q-td :props="{ col }">
            <q-select
              v-bind="QSelectProps"
              v-model="row.ToSkuId"
              :ref="(el) => (inputRefs[`ToSkuId-$${rowIndex}`] = el)"
              :rules="rules.ToSkuId"
              :options="row.ToSkus"
              :option-label="skuOptionsLabel"
              option-value="_id"
              map-options
              emit-value
            >
            </q-select>
          </q-td>
        </template>
      </q-table>

      <template #actions>
        <q-btn v-bind="QBtnProps" color="grey" label="取消" @click="onDialogCancel" />
        <q-btn v-bind="QBtnProps" color="primary" label="轉移" @click="onSaveClick" />
      </template>
    </my-dialog-content>
  </q-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { validate } from 'utils/quasar/validate.js'
import { required } from 'utils/quasar/rules.js'
import { QInputProps, QSelectProps, QTableProps, QBtnProps } from 'utils/quasar/base-props'
import { cloneDeep } from 'lodash-es'
import { getWarehouse, postWarehouseStockMove } from 'api'
import { getSkuName } from 'utils/skus.js'

const $q = useQuasar()
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const columns = [
  { name: 'FromWarehouseId', label: '來源項目', field: 'FromWarehouseId', align: 'left' },
  { name: 'FromSkuId', label: '來源規格', field: 'FromSkuId', align: 'left' },
  { name: 'Amount', label: '轉移數量', field: 'Amount', align: 'left' },
  { name: 'ToWarehouseId', label: '目標項目', field: 'ToWarehouseId', align: 'left' },
  { name: 'ToSkuId', label: '目標規格', field: 'ToSkuId', align: 'left' },
]

const initData = {}
initData.editItem = { FromWarehouseId: null, FromSkuId: null, Amount: null, ToWarehouseId: null, ToSkuId: null }
const addEditItemRow = () => {
  editItem.StockMoveItems.push(cloneDeep(initData.editItem))
}

const editItem = reactive({ StockMoveItems: [cloneDeep(initData.editItem)] })

const header = '庫存轉移'

const inputRefs = reactive({})
const rules = {
  FromWarehouseId: required({ label: '來源項目', type: 'select' }),
  FromSkuId: required({ label: '來源規格', type: 'select' }),
  Amount: required({ label: '轉移數量', type: 'input' }),
  ToWarehouseId: required({ label: '目標項目', type: 'select' }),
  ToSkuId: required({ label: '目標規格', type: 'select' }),
}

const callApi = async (param) => {
  const { error } = await postWarehouseStockMove(param)

  $q.notify({
    type: error ? 'negative' : 'positive',
    message: header + (error ? '失敗' : '成功'),
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

const onWarehouseSelect = (opt, row, key) => {
  row[`${key}WarehouseId`] = opt._id
  row[`${key}Skus`] = opt.Skus
  row[`${key}SkuId`] = null
}

const onWarehouseClear = (row, key) => {
  row[`${key}Skus`] = []
  row[`${key}SkuId`] = null
}

const skuOptionsLabel = (opt) => {
  if (opt) {
    let label = getSkuName(opt.SkuOptions, true)
    label += `, 庫存: ${opt.Stock}`
    return label
  } else {
    return null
  }
}

const onFromSkuOptionsSelect = (opt, row) => {
  row.FromSkuId = opt._id
  row.FromStock = opt.Stock
}

const onFromSkuOptionsClear = (row) => {
  row.FromStock = 0
}

const warehouseItems = ref([])
const GetWarehouse = async () => {
  const { data } = await getWarehouse()
  if (data.Items) warehouseItems.value = data.Items
}

const init = () => {
  GetWarehouse()
}
init()
</script>

