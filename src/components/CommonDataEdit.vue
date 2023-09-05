<template>
  <q-dialog ref="dialogRef">
    <my-dialog-content :header="header" @close="onDialogCancel">
      <div class="grid gap-2">
        <q-input
          v-bind="QInputProps"
          :ref="(el) => (inputRefs.Id = el)"
          :rules="rules.Id"
          v-model="editItem.Id"
          :label="`${title}代碼`"
          :readonly="editType !== 'add'"
        ></q-input>
        <q-input
          v-bind="QInputProps"
          :ref="(el) => (inputRefs.Name = el)"
          :rules="rules.Name"
          v-model="editItem.Name"
          :label="`${title}名稱`"
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
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { QInputProps } from 'utils/quasar/base-props'
import { validate } from 'utils/quasar/validate.js'
import { required } from 'utils/quasar/rules.js'
import { postCommonDataItem, putCommonDataItem, deleteCommonDataItem } from 'api'
import { cloneDeep } from 'lodash-es'
import { useList } from 'utils/use-list'

const $q = useQuasar()
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  editType: String,
  category: String,
  title: String,
  data: {
    type: Object,
    default: () => ({
      Id: null,
      Name: null,
    }),
  },
})

const editItem = reactive({ ...cloneDeep(props.data), Category: props.category })

const header = computed(() => {
  const headerObj = {
    add: `新增${props.title}`,
    edit: `編輯${props.title}`,
    delete: `刪除${props.title}`,
  }
  return headerObj[props.editType]
})

const inputRefs = reactive({})
const rules = {
  Id: required({ label: `${props.title}代碼`, type: 'input' }),
  Name: required({ label: `${props.title}名稱`, type: 'input' }),
}

const callApi = async (param) => {
  const api = {
    add: postCommonDataItem,
    edit: putCommonDataItem,
    delete: deleteCommonDataItem,
  }

  const { error } = await api[props.editType](param)

  $q.notify({
    type: error ? 'negative' : 'positive',
    message: header.value + (error ? '失敗' : '成功'),
    position: 'top',
  })

  if (!error) {
    useList.regetList([props.category])
    onDialogOK()
  }
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

