<template>
  <q-table
    ref="tableRef"
    v-bind="QTableProps"
    :columns="skusColumns"
    :rows="skus"
    row-key="_id"
    :pagination="{ rowsPerPage: -1 }"
  >
    <template #top>
      <div class="text-xl font-bold">總規格與庫存</div>
    </template>
    <template #body-cell-Stock="{ col, row, rowIndex }">
      <q-td :props="{ col }">
        <q-input
          v-bind="QInputProps"
          v-model="row.Stock"
          :ref="(el) => (inputRefs[`Stock-${rowIndex}`] = el)"
          :rules="rules.Stock"
          type="number"
          :min="0"
          :readonly="row.readonly || readonly"
          @blur="row.Stock < 0 ? (row.Stock = 0) : null"
        ></q-input>
      </q-td>
    </template>
    <template #body-cell-Remark="{ col, row, rowIndex }">
      <q-td :props="{ col }">
        <q-input
          v-if="row.Stock && Number(row.Stock) !== originSkus[rowIndex].Stock"
          v-bind="QInputProps"
          v-model="row.Remark"
          :ref="(el) => (inputRefs[`Remark-${rowIndex}`] = el)"
          :rules="rules.Remark"
          :readonly="row.readonly || readonly"
        ></q-input>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import { validate } from 'utils/quasar/validate.js'
import { required } from 'utils/quasar/rules.js'
import { QInputProps, QTableProps } from 'utils/quasar/base-props'
import { cloneDeep } from 'lodash-es'
import Sortable from 'sortablejs'

const props = defineProps({
  skus: {
    type: Array,
    default: () => [],
  },

  options: {
    type: Array,
    default: () => [],
  },

  stockUpdate: Boolean,
  readonly: Boolean,
})

const emit = defineEmits(['update:skus'])

const skusColumns = computed(() => {
  const options = props.options.map((option) => ({
    name: option.Name,
    label: option.Name,
    field: (row) => row.SkuOptions.find(({ OptionName }) => OptionName === option.Name)?.OptionValue,
    align: 'left',
  }))

  const arr = [
    ...(options.length
      ? options
      : [
          {
            name: 'NoOptions',
            field: (row) => row.SkuOptions[0].OptionValue,
            align: 'left',
          },
        ]),
    {
      name: 'Stock',
      label: '庫存',
      field: 'Stock',
      align: 'left',
      headerClasses: props.stockUpdate ? 'w-2/5' : 'w-1/2',
    },
  ]

  if (props.stockUpdate) {
    arr.push({ name: 'Remark', label: '變更庫存原因', field: 'Remark', align: 'left', headerClasses: 'w-2/5' })
  }

  return arr
})

const originSkus = cloneDeep(props.skus)

const inputRefs = reactive({})
const rules = reactive({
  Stock: required({ label: '庫存', type: 'input' }),
  Remark: required({ label: '變更庫存原因', type: 'input' }),
})

const onDragUpdate = (evt) => {
  const oldIndex = evt.oldIndex
  const newIndex = evt.newIndex
  const list = cloneDeep(props.skus)
  list.splice(newIndex, 0, list.splice(oldIndex, 1)[0])
  emit('update:skus', list)
}

const tableRef = ref()
const setSortable = () => {
  new Sortable(tableRef.value.$el.querySelector('tbody'), {
    group: 'skus',
    animation: 150,
    onUpdate: onDragUpdate,
  })
}

onMounted(setSortable)

defineExpose({
  validate: () => validate(inputRefs),
})
</script>

