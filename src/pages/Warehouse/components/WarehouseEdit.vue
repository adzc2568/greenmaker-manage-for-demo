<template>
  <q-dialog ref="dialogRef" full-width no-backdrop-dismiss>
    <my-dialog-content class="self-start" :header="header" @close="onDialogCancel">
      <div class="mt-2 grid grid-cols-12 gap-2">
        <my-filter-select
          class="col-span-4"
          v-bind="QSelectProps"
          :ref="(el) => (inputRefs.TypeId = el)"
          :rules="rules.TypeId"
          v-model="editItem.TypeId"
          label="類型"
          list-key="WarehouseType"
          @update:model-value="onTypeSelect"
          :readonly="editType !== 'add'"
        ></my-filter-select>
        <q-input
          class="col-span-8"
          v-bind="QInputProps"
          :ref="(el) => (inputRefs.Name = el)"
          :rules="rules.Name"
          v-model="editItem.Name"
          label="名稱"
          :readonly="editType === 'delete' || editType === 'stock-update'"
        ></q-input>

        <q-card v-if="editItem.Options[0]">
          <q-card-section>
            <div>規格一</div>

            <div>
              <div>規格名稱</div>
              <div :ref="(el) => (optionsContainerRefs[0] = el)">
                <q-input v-for="(item, index) in editItem.Options[0].Items" :key="index" v-model="item"></q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>
        <q-card v-if="editItem.Options[1]">
          <q-card-section>
            <div>規格二</div>

            <div>
              <div>規格名稱</div>
              <div :ref="(el) => (optionsContainerRefs[1] = el)">
                <q-input v-for="(item, index) in editItem.Options[0].Items" :key="index" v-model="item"></q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card v-if="editItem.Options.length < 2" @click="onAddOptionClick">
          <q-card-section>

          </q-card-section>
        </q-card>

        <sku-options-card
          v-if="editType !== 'stock-update'"
          class="col-span-full"
          v-model:options="editItem.Options"
          :readonly="editType === 'delete'"
          @update:options="setSkus"
        >
          <template #btn-append>
            <q-btn v-bind="QBtnProps" color="primary" label="帶入常用規格" @click="setCommonOptions"></q-btn>
          </template>
        </sku-options-card>

        <skus-table
          ref="skusTableRef"
          class="col-span-full"
          v-model:skus="editItem.Skus"
          :options="editItem.Options"
          :stockUpdate="editType === 'stock-update'"
          :readonly="editType === 'delete'"
        ></skus-table>
      </div>

      <template #actions>
        <q-btn unelevated color="grey" label="取消" @click="onDialogCancel" />
        <q-btn v-if="editType === 'add'" unelevated color="secondary" label="新增" @click="onSaveClick" />
        <q-btn
          v-if="editType === 'edit' || editType === 'stock-update'"
          unelevated
          color="primary"
          label="儲存"
          @click="onSaveClick"
        />
        <q-btn v-if="editType === 'delete'" unelevated color="negative" label="刪除" @click="onDeleteClick" />
      </template>
    </my-dialog-content>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { validate } from 'utils/quasar/validate.js'
import { required } from 'utils/quasar/rules.js'
import { QInputProps, QSelectProps, QBtnProps } from 'utils/quasar/base-props'
import { cloneDeep } from 'lodash-es'
import { postWarehouseItem, putWarehouseItem, deleteWarehouseItem, putWarehouseStockUpdate } from 'api'
import { baseOptions } from '../common/options.js'
import { initSkus, skusGenerate, getSkuName } from 'utils/skus.js'
import SkuOptionsCard from 'components/SkuOptionsCard.vue'
import SkusTable from 'components/SkusTable.vue'
import Sortable from 'sortablejs'

const $q = useQuasar()
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const skusTableRef = ref()

const props = defineProps({
  editType: { type: String, required: true },
  data: {
    type: Object,
    default: () => ({
      TypeId: null,
      Name: null,
      Options: [],
      Skus: cloneDeep(initSkus),
    }),
  },
})

const setSkus = () => {
  const skus = skusGenerate(editItem.Options)

  const oldSkus = []
  for (let i = 0; i < originSkus.length; i++) {
    for (let j = 0; j < skus.length; j++) {
      const aKey = getSkuName(originSkus[i].SkuOptions)
      const bKey = getSkuName(skus[j].SkuOptions)

      if (aKey === bKey) {
        skus.splice(j, 1)
        oldSkus.push(cloneDeep(originSkus[i]))
        j = 0
      }
    }
  }

  const newSkus = skus

  editItem.Skus = oldSkus.concat(newSkus)
}

const editItem = reactive(
  (() => {
    const cloneData = cloneDeep(props.data)
    cloneData.Skus = cloneData.Skus.map((sku) => ({ ...sku, readonly: props.editType === 'edit' }))
    return cloneData
  })()
)

const originSkus = cloneDeep(editItem.Skus)

const header = computed(() => {
  const headerObj = {
    add: '新增倉儲項目',
    edit: '編輯倉儲項目',
    delete: '刪除倉儲項目',
    'stock-update': '變更倉儲項目庫存',
  }
  return headerObj[props.editType]
})

const inputRefs = reactive({})
const rules = reactive({
  TypeId: required({ label: '類型', type: 'input' }),
  Name: required({ label: '名稱', type: 'input' }),
})

const callApi = async (param) => {
  const api = {
    add: postWarehouseItem,
    edit: putWarehouseItem,
    delete: deleteWarehouseItem,
    'stock-update': putWarehouseStockUpdate,
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

  const cloneEditItem = cloneDeep(editItem)
  cloneEditItem.Skus = cloneEditItem.Skus.map((sku, index) => ({ ...sku, Index: index }))
  if (props.editType === 'stock-update') {
    cloneEditItem.Skus = cloneEditItem.Skus.filter(
      (sku, index) => sku.Stock && Number(sku.Stock) !== originSkus[index].Stock
    )
  }

  callApi(cloneEditItem)
}

const onDeleteClick = () => {
  callApi(editItem._id)
}

const onTypeSelect = (val) => {
  if (!val) return
  editItem.Options = cloneDeep(baseOptions[val]) || []
  setSkus()
}

const setCommonOptions = () => {
  onTypeSelect(editItem.TypeId)
}

const onDragUpdate = (evt, options) => {
  const oldIndex = evt.oldIndex
  const newIndex = evt.newIndex
  options.splice(newIndex, 0, options.splice(oldIndex, 1)[0])
}

const optionsContainerRefs = [ref(), ref()]
const setSortable = (index) => {
  new Sortable(optionsContainerRefs[index].value, {
    group: `options-${index}`,
    animation: 150,
    onUpdate: (evt) => onDragUpdate(evt, editItem.Options[index]),
  })
}

const addOption = () => {
  if (editItem.Options.length >= 2) return
  editItem.Options.push({
    Name: null,
    Items: [],
  })
}

const onAddOptionClick = async () => {
  addOption()
  await nextTick()
  setSortable(editItem.Options.length - 1)
}

onMounted(setSortable)
</script>

