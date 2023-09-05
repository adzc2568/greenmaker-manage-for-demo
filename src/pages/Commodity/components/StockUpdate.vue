<template>
  <q-dialog ref="dialogRef">
    <my-dialog-content header="庫存變更" @close="onDialogCancel">
      <div>
        <!-- <q-input v-model=""></q-input> -->
        <q-input v-bind="QInputProps" :model-value="editItem.Price" label="價格" readonly></q-input>
        <q-input v-bind="QInputProps" v-model="editItem.Stock" label="庫存"></q-input>
        <q-input v-bind="QInputProps" v-model="editItem.Description" label="庫存變更記錄說明"></q-input>
        <q-icon :name="editItem.IsLaunched ? 'check_box' : 'check_box_outline_blank'" color="primary"></q-icon>
      </div>

      <template #actions>
        <q-btn unelevated color="grey" label="取消" @click="onDialogCancel" />
        <q-btn unelevated color="primary" label="儲存" @click="onOKClick" />
      </template>
    </my-dialog-content>
  </q-dialog>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { validate } from 'utils/quasar/validate.js'
import { required } from 'utils/quasar/rules.js'
import { QInputProps } from 'utils/quasar/base-props'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  editType: String,
  data: {
    type: Object,
    default: () => ({
      Options: {},
      Price: null,
      Stock: null,
      IsLaunched: false,
    }),
  },
})

const skusColumns = [
  { name: 'Options', label: '規格', field: 'Options', align: 'left' },
  { name: 'Price', label: '價格', field: 'Price', align: 'left' },
  { name: 'Stock', label: '庫存', field: 'Stock', align: 'left' },
  { name: 'IsLaunched', label: '是否販售', field: 'IsLaunched', align: 'left' },
]

const editItem = reactive(props.data)

const inputRefs = reactive({})
const rules = {
  Id: required({ label: '代碼', type: 'input' }),
  Name: required({ label: '名稱', type: 'input' }),
}

const onOKClick = () => {
  if (editType !== 'delete') {
    const { result, errorInputRef } = validate(inputRefs)
    if (!result) {
      errorInputRef.focus()
      return
    }
  }
  onDialogOK(editItem)
}
</script>

