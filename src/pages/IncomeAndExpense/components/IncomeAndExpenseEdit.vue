<template>
  <q-dialog ref="dialogRef">
    <my-dialog-content :header="header" @close="onDialogCancel">
      <div class="grid gap-2">
        <my-date-input
          v-bind="QInputProps"
          :ref="(el) => (inputRefs.Date = el)"
          :rules="rules.Date"
          v-model="editItem.Date"
          label="日期"
          :readonly="editType === 'delete'"
        ></my-date-input>
        <q-input
          v-bind="QInputProps"
          :ref="(el) => (inputRefs.ItemName = el)"
          :rules="rules.ItemName"
          v-model="editItem.ItemName"
          label="品項名稱"
          :readonly="editType === 'delete'"
        ></q-input>
        <q-input
          v-bind="QInputProps"
          :ref="(el) => (inputRefs.Cost = el)"
          :rules="rules.Cost"
          v-model="editItem.Cost"
          label="金額"
          type="number"
          :readonly="editType === 'delete'"
        ></q-input>

        <q-input
          v-bind="QInputProps"
          v-model="editItem.Remark"
          label="備註"
          type="textarea"
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
import { reactive, computed } from 'vue'
import { useQuasar, useDialogPluginComponent } from 'quasar'
import { validate } from 'utils/quasar/validate.js'
import { required, useDate } from 'utils/quasar/rules.js'
import { QInputProps } from 'utils/quasar/base-props'
import {
  postIncomeItem,
  putIncomeItem,
  deleteIncomeItem,
  postExpenseItem,
  putExpenseItem,
  deleteExpenseItem,
} from 'api'

const $q = useQuasar()
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  editType: String,
  dataType: String,
  data: {
    type: Object,
    default: () => ({
      Date: null,
      ItemName: null,
      Cost: null,
      Remark: null,
    }),
  },
})

const header = computed(() => {
  const headerMap = {
    add: '新增',
    edit: '編輯',
    delete: '刪除',
  }
  const typeMap = {
    income: '收入',
    expense: '支出',
  }
  return headerMap[props.editType] + typeMap[props.dataType]
})

const editItem = reactive(props.data)

const inputRefs = reactive({})
const rules = {
  Date: useDate(),
  ItemName: required({ label: '收入品項', type: 'input' }),
  Cost: required({ label: '金額', type: 'input' }),
}

const callApi = async (param) => {
  const api = {
    add: {
      income: postIncomeItem,
      expense: postExpenseItem,
    },
    edit: {
      income: putIncomeItem,
      expense: putExpenseItem,
    },
    delete: {
      income: deleteIncomeItem,
      expense: deleteExpenseItem,
    },
  }

  const { error } = await api[props.editType][props.dataType](param)

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
</script>

