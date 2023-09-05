<template>
  <q-dialog ref="dialogRef" full-width>
    <my-dialog-content :header="header" @close="onDialogCancel">
      <div class="grid grid-cols-12 gap-2">
        <my-date-input
          class="col-span-4"
          v-bind="QInputProps"
          :ref="(el) => (inputRefs.RecordDate = el)"
          :rules="rules.RecordDate"
          v-model="editItem.RecordDate"
          label="工作日期"
          :readonly="editType !== 'add'"
        ></my-date-input>
        <q-select
          class="col-span-8"
          v-bind="QSelectProps"
          v-model="editItem.WorkEventIds"
          label="事件"
          :options="WorkEventItems"
          option-label="Name"
          option-value="Id"
          emit-value
          map-options
          multiple
          use-chips
          :readonly="editType === 'delete'"
        >
        </q-select>
        <q-input
          class="col-span-full"
          v-bind="QInputProps"
          v-model="editItem.Content"
          label="工作內容"
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
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { QInputProps, QSelectProps } from 'utils/quasar/base-props'
import { validate } from 'utils/quasar/validate.js'
import { required } from 'utils/quasar/rules.js'
import { postWorkRecordItem, putWorkRecordItem, deleteWorkRecordItem } from 'api'
import { cloneDeep } from 'lodash-es'
import { useList } from 'utils/use-list'
import dayjs from 'dayjs'

const $q = useQuasar()
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  editType: String,
  category: String,
  name: String,
  data: {
    type: Object,
    default: () => ({
      RecordDate: dayjs().format('YYYY-MM-DD'),
      WorkEventIds: [],
      Content: null,
    }),
  },
})

const editItem = reactive(cloneDeep(props.data))

const header = computed(() => {
  switch (props.editType) {
    case 'add':
      return `新增工作日誌`
    case 'edit':
      return `編輯工作日誌`
    case 'delete':
      return `刪除工作日誌`
    default:
      return null
  }
})

const inputRefs = reactive({})
const rules = {
  RecordDate: required({ label: '工作日期', type: 'input' }),
}

const callApi = async (param) => {
  const api = {
    add: postWorkRecordItem,
    edit: putWorkRecordItem,
    delete: deleteWorkRecordItem,
  }

  const { error } = await api[props.editType](param)

  $q.notify({
    type: error ? 'negative' : 'positive',
    message: header.value + (error ? '失敗' : '成功'),
    position: 'top',
  })

  if (!error) {
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

const listKeys = ['WorkEvent']
const { WorkEvent: WorkEventItems } = useList(listKeys)
</script>

