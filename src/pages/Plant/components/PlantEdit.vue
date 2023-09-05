<template>
  <q-dialog ref="dialogRef" full-width persistent>
    <my-dialog-content :header="header" :width="1280" @close="onCancelClick">
      <div class="grid gap-4 sm:grid-cols-12">
        <div class="grid gap-2 sm:col-span-4">
          <q-select
            v-bind="QSelectProps"
            v-model="editItem.Taxonomy.Family"
            label="科名"
            :options="taxonomyFamilyItems"
            :option-label="(opt) => (opt ? `${opt.Name}（${opt.Id}）` : null)"
            option-value="Id"
            emit-value
            map-options
            :readonly="editType === 'delete'"
            @update:model-value="editing = true"
          ></q-select>
          <q-select
            v-bind="QSelectProps"
            v-model="editItem.Taxonomy.Genus"
            label="屬名"
            :options="taxonomyGenusItems"
            :option-label="(opt) => (opt ? `${opt.Name}（${opt.Id}）` : null)"
            option-value="Id"
            emit-value
            map-options
            :readonly="editType === 'delete'"
            @update:model-value="editing = true"
          ></q-select>
          <q-input
            v-bind="QInputProps"
            v-model="editItem.ScientificName"
            label="學名"
            :readonly="editType === 'delete'"
            @update:model-value="editing = true"
          ></q-input>
          <q-input
            v-bind="QInputProps"
            :ref="(el) => (inputRefs.BusinessName = el)"
            :rules="rules.BusinessName"
            v-model="editItem.BusinessName"
            label="商業名稱*"
            :readonly="editType === 'delete'"
            @update:model-value="onBusinessNameUpdate"
          ></q-input>
          <q-input
            v-bind="QInputProps"
            v-model="editItem.Description"
            label="描述"
            :readonly="editType === 'delete'"
            @update:model-value="editing = true"
          ></q-input>
        </div>

        <div class="sm:col-span-8">
          <image-upload
            class="h-full"
            ref="uploadImageRef"
            :parentId="editItem._id"
            type="Plant"
            v-model:images="editItem.Images"
            @update:images="onImageUpdate"
            :readonly="editType === 'delete'"
          ></image-upload>
        </div>
      </div>

      <template #actions>
        <q-btn v-bind="QBtnProps" color="grey" label="取消" @click="onCancelClick" />
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
import { cloneDeep } from 'lodash-es'
import { validate } from 'utils/quasar/validate.js'
import { required } from 'utils/quasar/rules.js'
import { QInputProps, QSelectProps, QBtnProps } from 'utils/quasar/base-props'
import ImageUpload from 'components/ImageUpload.vue'
import { postPlantItem, putPlantItem, deletePlantItem } from 'api'
import { useList } from 'utils/use-list.js'

const $q = useQuasar()
const uploadImageRef = ref()
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const editing = ref(false)

const props = defineProps({
  editType: String,
  data: {
    type: Object,
    default: () => ({
      ScientificName: null,
      BusinessName: null,
      Description: null,
      Taxonomy: {
        Family: null,
        Genus: null,
      },
      ImageIds: [],
      Images: [],
    }),
  },
})

const header = computed(() => {
  switch (props.editType) {
    case 'add':
      return `新增植物`
    case 'edit':
      return `編輯植物`
    case 'delete':
      return `刪除植物`
    default:
      return null
  }
})

const editItem = reactive(cloneDeep(props.data))

const inputRefs = reactive({})
const rules = {
  BusinessName: required({ label: '商業名稱', type: 'input' }),
}

const callApi = async (param) => {
  const api = {
    add: postPlantItem,
    edit: putPlantItem,
    delete: deletePlantItem,
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

  if (editItem.Images.find((image) => !image.cropData)) {
    $q.notify({
      type: 'negative',
      message: '上傳的圖片尚未剪裁',
      position: 'top',
    })
    return
  }

  callApi(editItem)
}

const onDeleteClick = () => {
  callApi(editItem._id)
}

const listKeys = ['TaxonomyFamily', 'TaxonomyGenus']
const { TaxonomyFamily: taxonomyFamilyItems, TaxonomyGenus: taxonomyGenusItems } = useList(listKeys)

const onCancelClick = () => {
  if (editing.value) {
    $q.dialog({
      message: '編輯中的資料尚未儲存，是否確定關閉視窗？',
      ok: {
        ...QBtnProps,
      },
      cancel: {
        ...QBtnProps,
        color: 'grey',
      },
    }).onOk(onDialogCancel)
  } else {
    onDialogCancel()
  }
}

const onBusinessNameUpdate = () => {
  editing.value = true
  editItem.Images.forEach((image, index) => {
    image.Name = `${editItem.BusinessName}_${index + 1}`
  })
}

const onImageUpdate = (val) => {
  editing.value = true
  val.forEach((image, index) => {
    image.Name = `${editItem.BusinessName}_${index + 1}`
  })
  editItem.ImageIds = val.map(({ _id }) => _id)
}
</script>

