<template>
  <q-dialog ref="dialogRef" no-backdrop-dismiss>
    <my-dialog-content :header="header" @close="onDialogCancel">
      <q-input
        v-bind="QInputProps"
        label="規格名稱"
        :ref="inputRefs.SkuName"
        :rules="rules.SkuName"
        v-model="editItem.SkuName"
        :readonly="editType !== 'delete'"
      ></q-input>

      <template #actions>
        <q-btn v-bind="QBtnProps" color="grey" label="取消" @click="onDialogCancel" />
        <q-btn
          v-if="editType === 'add'"
          v-bind="QBtnProps"
          color="secondary"
          label="新增"
          :loading="actionLoading"
          @click="onSaveClick"
        />
        <q-btn
          v-if="editType === 'edit'"
          v-bind="QBtnProps"
          color="primary"
          label="儲存"
          :loading="actionLoading"
          @click="onSaveClick"
        />
        <q-btn
          v-if="editType === 'delete'"
          v-bind="QBtnProps"
          color="negative"
          label="刪除"
          :loading="actionLoading"
          @click="onDeleteClick"
        />
      </template>
    </my-dialog-content>
  </q-dialog>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { QInputProps, QBtnProps } from 'utils/quasar/base-props'
import { validate } from 'utils/quasar/validate.js'
import { required } from 'utils/quasar/rules.js'
import { cloneDeep } from 'lodash-es'
import { postSkuItem, putSkuItem, deleteSkuItem } from 'api'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  editType: String,
  data: {
    type: Object,
    default: () => ({
      SkuName: null,
    }),
  },
})

const header = computed(() => {
  const headerMap = {
    add: '新增規格',
    edit: '編輯規格',
    delete: '刪除規格',
  }
  return headerMap[props.editType]
})

const editItem = reactive(cloneDeep(props.data))

const inputRefs = reactive({})
const rules = {
  SkuName: required({ title: '規格名稱', type: 'input' }),
}

const actionLoading = ref(false)
const callApi = async (param) => {
  actionLoading.value = true

  const api = {
    add: postSkuItem,
    edit: putSkuItem,
    delete: deleteSkuItem,
  }

  const { error } = await api[props.editType](param)

  $q.notify({
    type: error ? 'negative' : 'positive',
    message: header.value + (error ? '失敗' : '成功'),
    position: 'top',
  })

  if (!error) onDialogOK()

  actionLoading.value = false
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

