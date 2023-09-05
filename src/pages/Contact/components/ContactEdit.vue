<template>
  <q-dialog ref="dialogRef" no-backdrop-dismiss>
    <my-dialog-content :header="header" @close="onDialogCancel">
      <div class="grid gap-2">
        <q-input
          v-bind="QInputProps"
          :ref="(el) => (inputRefs.Name = el)"
          :rules="rules.Name"
          v-model="editItem.Name"
          label="聯絡人名稱*"
          :readonly="editType === 'delete'"
        ></q-input>
        <q-input
          v-bind="QInputProps"
          v-model="editItem.Address"
          label="地址"
          :readonly="editType === 'delete'"
        ></q-input>
        <q-input v-bind="QInputProps" v-model="editItem.Phone" label="電話" :readonly="editType === 'delete'"></q-input>
        <q-input
          v-bind="QInputProps"
          v-model="editItem.Website"
          label="網頁"
          :readonly="editType === 'delete'"
        ></q-input>
        <q-input
          v-bind="QInputProps"
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
import { reactive, computed } from 'vue'
import { useQuasar, useDialogPluginComponent } from 'quasar'
import { validate } from 'utils/quasar/validate.js'
import { required } from 'utils/quasar/rules.js'
import { QInputProps } from 'utils/quasar/base-props'
import { cloneDeep } from 'lodash-es'
import { postContactItem, putContactItem, deleteContactItem } from 'api'
const $q = useQuasar()

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  editType: String,
  data: {
    type: Object,
    default: () => ({
      Name: null,
      Address: null,
      Phone: null,
      Website: null,
      Remark: null,
    }),
  },
})

const editItem = reactive(cloneDeep(props.data))

const header = computed(() => {
  const headerMap = {
    add: '新增聯絡人',
    edit: '編輯聯絡人',
    delete: '刪除聯絡人',
  }
  return headerMap[props.editType]
})

const inputRefs = reactive({})
const rules = {
  Name: required({ label: '聯絡人名稱', type: 'input' }),
}

const callApi = async (param) => {
  const api = {
    add: postContactItem,
    edit: putContactItem,
    delete: deleteContactItem,
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
</script>

