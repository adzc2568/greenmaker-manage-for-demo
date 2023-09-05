<template>
  <q-dialog ref="dialogRef" no-backdrop-dismiss>
    <my-dialog-content :header="header" @close="onDialogCancel">
      <q-input
        v-bind="QInputProps"
        label="規格名稱"
        :ref="(el) => (inputRefs.SkuGroupName = el)"
        :rules="rules.SkuGroupName"
        v-model="editItem.SkuGroupName"
        :readonly="editType === 'delete'"
      ></q-input>

      <div class="mt-4">
        <div>規格項目</div>
        <ul class="list-disc pl-10">
          <li v-for="(item, index) in editItem.Skus" :key="index">
            <span>{{ item.SkuName }}</span>
            <q-btn
              v-bind="QBtnProps"
              icon="close"
              round
              dense
              size="sm"
              class="ml-4"
              @click="editItem.Skus.splice(index, 1)"
            ></q-btn>
          </li>
          <li v-if="editType !== 'delete'">
            <q-input
              v-bind="QInputProps"
              v-model="newSkuName"
              @keydown.enter="onAddItemClick"
              :readonly="editType === 'delete'"
            >
              <template #append>
                <q-btn v-bind="QBtnProps" label="添加" color="secondary" @click="onAddItemClick"></q-btn>
              </template>
            </q-input>
          </li>
        </ul>
      </div>

      <template #actions>
        <q-btn v-bind="QBtnProps" color="grey" label="取消" @click="onDialogCancel" />
        <q-btn v-if="editType === 'add'" v-bind="QBtnProps" color="secondary" label="新增" @click="onSaveClick" />
        <q-btn v-if="editType === 'edit'" v-bind="QBtnProps" color="primary" label="儲存" @click="onSaveClick" />
        <q-btn v-if="editType === 'delete'" v-bind="QBtnProps" color="negative" label="刪除" @click="onDeleteClick" />
      </template>
    </my-dialog-content>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { QInputProps, QSelectProps, QBtnProps } from 'utils/quasar/base-props'
import { validate } from 'utils/quasar/validate.js'
import { required } from 'utils/quasar/rules.js'
import { cloneDeep } from 'lodash-es'
import { postSkuGroupItem, putSkuGroupItem, deleteSkuGroupItem } from 'api'

const $q = useQuasar()
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  editType: String,
  data: {
    type: Object,
    default: () => ({
      SkuGroupName: null,
      Skus: [],
    }),
  },
})

const header = computed(() => {
  const headerObj = {
    add: '新增規格',
    edit: '編輯規格',
    delete: '刪除規格',
  }
  return headerObj[props.editType]
})

const editItem = reactive(cloneDeep(props.data))
const newSkuName = ref(null)

const inputRefs = reactive({})
const rules = {
  SkuGroupName: required({ label: '規格名稱', type: 'input' }),
}

const callApi = async (param) => {
  const api = {
    add: postSkuGroupItem,
    edit: putSkuGroupItem,
    delete: deleteSkuGroupItem,
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

const onAddItemClick = () => {
  if (!newSkuName.value) return

  editItem.Skus.push({ SkuName: newSkuName.value })
  newSkuName.value = null
}
</script>

