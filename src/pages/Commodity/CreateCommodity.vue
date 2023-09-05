<template>
  <q-page class="grid gap-4 p-4">
    <div class="flex">
      <q-btn v-bind="QBtnProps" color="green" label="圖片管理" @click="toAddImageDialog"></q-btn>
      <q-space></q-space>
      <q-btn v-bind="QBtnProps" color="primary" label="儲存" @click="onSaveClick"></q-btn>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <my-filter-select
        class="col-span-2"
        v-bind="QSelectProps"
        :ref="(el) => (inputRefs.TypeId = el)"
        :rules="rules.TypeId"
        v-model="commodity.TypeId"
        label="分類"
        list-key="CommodityType"
      ></my-filter-select>
      <q-input
        class="col-span-5"
        v-bind="QInputProps"
        :ref="(el) => (inputRefs.Title = el)"
        :rules="rules.Title"
        v-model="commodity.Title"
        label="標題"
      ></q-input>
      <q-input
        class="col-span-5"
        v-bind="QInputProps"
        :ref="(el) => (inputRefs.UrlTitle = el)"
        :rules="rules.UrlTitle"
        v-model="commodity.UrlTitle"
        label="Url Title"
      ></q-input>

      <my-filter-select
        class="col-span-12"
        v-bind="QSelectProps"
        v-model="commodity.TagIds"
        label="標籤"
        list-key="Tag"
        use-chips
        multiple
      ></my-filter-select>
    </div>

    <sku-options-card v-model:options="commodity.Options" @update:options="setSkus">
      <template #btn-append>
        <q-btn v-bind="QBtnProps" color="primary" label="帶入常用規格" @click="setCommonOptions"></q-btn>
      </template>
    </sku-options-card>

    <skus-table
      ref="skusTableRef"
      v-model:skus="commodity.Skus"
      :options="commodity.Options"
      :stockUpdate="editType === 'stock-update'"
    ></skus-table>

    <tiptap-editor
      ref="editorRef"
      :id="commodity._id"
      v-model:content="commodity.Content"
      v-model:images="commodity.Images"
      @update:images="onImagesUpdate"
      @update:content="onContentUpdate"
    ></tiptap-editor>
  </q-page>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { validate } from 'utils/quasar/validate.js'
import { required } from 'utils/quasar/rules.js'
import { getCommodityItem } from 'api'
import TiptapEditor from 'components/editor/TiptapEditor.vue'
import { QInputProps, QSelectProps, QBtnProps } from 'utils/quasar/base-props'
import { cloneDeep } from 'lodash-es'
import AddImageDialog from 'components/editor/AddImageDialog.vue'
import SkuOptionsCard from 'components/SkuOptionsCard.vue'
import SkusTable from 'components/SkusTable.vue'
import { skusGenerate, getSkuName } from 'utils/skus.js'
import { baseOptions } from 'pages/Warehouse/common/options.js'

const editorRef = ref()
const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const editType = computed(() => {
  if (route.params._id) return 'edit'
  else return 'add'
})

const header = computed(() => {
  const headerObj = {
    add: '新增商品',
    edit: '編輯商品',
  }
  return headerObj[editType.value]
})

const commodity = reactive({
  _id: null,
  Title: null,
  UrlTitle: null,

  TypeId: null,
  TypeName: null,

  TagIds: [],
  TagNames: [],

  Content: null,
  Summary: null,

  ImageIds: [],
  Images: [],

  Options: [],
  SKUs: [],
})

const GetCommodityItem = async () => {
  const { data, error } = await getCommodityItem(route.params._id)
  if (error)
    $q.notify({
      message: '取得商品資料失敗',
      position: 'top',
      type: 'negative',
    })
  if (data) Object.assign(commodity, data)
}

const setSkus = () => {
  const skus = skusGenerate(commodity.Options)

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

  commodity.Skus = oldSkus.concat(newSkus)
}

const toAddImageDialog = () => {
  $q.dialog({
    component: AddImageDialog,
    componentProps: {
      type: 'Commodity',
      id: commodity._id,
      images: commodity.Images,
      draggable: true,
      'onUpdate:images': (val) => {
        commodity.Images = val
      },
    },
  })
}

const inputRefs = reactive({})
const rules = {
  TypeId: required({ label: '分類', type: 'select' }),
  Title: required({ label: '標題', type: 'input' }),
  UrlTitle: required({ label: 'Url Title', type: 'input' }),
}

const callApi = async (param) => {
  const api = {
    add: postArticleItem,
    edit: putArticleItem,
  }

  const { data, error } = await api[editType.value](param)

  $q.notify({
    type: error ? 'negative' : 'positive',
    message: header.value + (error ? '失敗' : '成功'),
    position: 'top',
  })

  if (!route.params._id && data) router.replace({ params: { _id: data._id } })
}

const onSaveClick = () => {
  const { result, errorInputRef } = validate(inputRefs)

  if (!result) {
    errorInputRef.focus()
    return
  }

  callApi(article)
}

const onTypeSelect = (val) => {
  if (!val) return
  commodity.Options = cloneDeep(baseOptions[val]) || []
  setSkus()
}

const setCommonOptions = () => {
  onTypeSelect(commodity.TypeId)
}

const onImagesUpdate = (val) => {
  val.forEach((image, index) => {
    image.Name = `${commodity.Title}_${index + 1}`
  })
  commodity.ImageIds = val.map(({ _id }) => _id)
}

const onContentUpdate = (val) => {
  sessionStorage.setItem(`temp-${article._id}`, JSON.stringify(val))
}

const isMounted = ref(false)
onMounted(() => (isMounted.value = true))

const init = async () => {
  if (route.params._id) {
    await GetCommodityItem()
  }

  const checkTemp = () => {
    return new Promise((resolve) => {
      const content = sessionStorage.getItem(`temp-${article._id}`)

      if (content) {
        $q.dialog({
          message: '檢查到此商品有一筆暫存資料，是否要讀取該暫存資料？',
          ok: {
            label: '讀取資料',
            color: 'primary',
            unelevated: true,
          },
          cancel: {
            label: '取消',
            color: 'grey',
            unelevated: true,
          },
        })
          .onOk(() => {
            article.Content = JSON.parse(content)
            resolve()
          })
          .onDismiss(() => {
            resolve()
          })
      } else {
        resolve()
      }
    })
  }

  const setEditor = () => {
    editorRef.value.setContent()
  }

  await checkTemp()

  if (isMounted.value) {
    setEditor()
  } else {
    const unwatch = watch(isMounted, (val) => {
      if (val) {
        setEditor()
        unwatch()
      }
    })
  }
}
init()
</script>

