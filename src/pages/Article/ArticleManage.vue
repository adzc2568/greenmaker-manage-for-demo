<template>
  <q-page class="q-pa-md">
    <my-search-area @searchSubmit="searchSubmit" @searchClear="searchClear">
      <my-filter-select
        v-bind="QSelectProps"
        v-model="search.Type"
        label="文章類別"
        list-key="ArticleType"
      ></my-filter-select>
      <q-input v-bind="QInputProps" v-model="search.Title" label="Title"></q-input>
      <my-filter-select v-bind="QSelectProps" v-model="search.Tags" label="文章類別" list-key="Tag"></my-filter-select>
      <my-date-input v-bind="QInputProps" v-model="search.CreateDateStart" label="CreateDate-Start"></my-date-input>
      <my-date-input v-bind="QInputProps" v-model="search.CreateDateEnd" label="CreateDate-End"></my-date-input>
      <my-filter-select
        v-bind="QSelectProps"
        v-model="search.ArticleStatus"
        label="文章狀態"
        list-key="ArticleStatus"
      ></my-filter-select>
    </my-search-area>

    <q-card flat bordered class="mt-2 [&>.q-card\_\_section:not(:first-child)]:pt-0">
      <q-card-section class="flex items-center gap-2">
        <div class="text-xl">文章管理</div>
        <q-space></q-space>
        <q-btn unelevated color="secondary" @click="toCreate">新增文章</q-btn>
      </q-card-section>
      <q-card-section ref="containerRef" class="grid gap-4">
        <my-edit-card v-for="item in items" :key="item._id" :menu="getMenu(item)" @menu-click="(fn) => fn(item)">
          <div class="grid min-h-[112px] grid-cols-12">
            <q-img
              v-if="item.Images.length > 0"
              class="col-span-4"
              :src="getImageSrc(item.Images[0])"
              :ratio="16 / 9"
              :width="item.Images[0].Width + 'px'"
            ></q-img>
            <div v-else class="bg-brown-11 col-span-4 flex items-center justify-center text-black">No Image</div>
            <q-card-section class="relative col-span-8">
              <div class="flex flex-col">
                <article>
                  <h1 class="text-2xl">{{ item.Title }}</h1>
                  <section>
                    <p>{{ item.Summary }}</p>
                  </section>
                </article>
              </div>
              <q-icon
                v-if="item.StatusId === 10"
                class="absolute right-4 top-4"
                name="check"
                size="sm"
                color="green"
              ></q-icon>
            </q-card-section>
          </div>
        </my-edit-card>
      </q-card-section>
      <q-card-section class="flex-center flex gap-4">
        <q-pagination
          v-bind="QPaginationProps"
          v-model="pagination.page"
          :max="Math.ceil(pagination.itemsNumber / pagination.itemsPerPage)"
          @update:model-value="GetArticle"
        ></q-pagination>
        <div>共 {{ pagination.itemsNumber }} 筆</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import setSearchQuery from 'utils/setSearchQuery'
import { getArticle, postArticlePublish, postArticleUnpublish } from 'api'
import { QInputProps, QSelectProps, QPaginationProps } from 'utils/quasar/base-props'
import { cloneDeep } from 'lodash-es'
import dayjs from 'dayjs'

const $q = useQuasar()
const router = useRouter()

const getMenu = (item) => {
  return [
    { label: '編輯', icon: 'edit', fn: (item) => toEdit(item) },
    { label: '刪除', icon: 'delete', fn: (item) => toDelete(item) },
    {
      label: '瀏覽',
      icon: 'visibility',
      fn: (item) => toPreview(item),
    },
    item.StatusId === 0
      ? { label: '發布', icon: 'file_upload', fn: (item) => PostArticlePublish(item) }
      : { label: '取消發布', icon: 'file_download', fn: (item) => PostArticleUnpublish(item) },
  ]
}

const loading = ref(false)
const items = ref([])
const GetArticle = async () => {
  loading.value = true

  const query = setSearchQuery({
    limit: pagination.itemsPerPage,
    skip: (pagination.page - 1) * pagination.itemsPerPage,
    // filter: filter.value,
  })

  const { data } = await getArticle(query)

  if (data) {
    items.value = data.Items
    pagination.itemsNumber = data.Count
  }

  loading.value = false
}

const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  itemsNumber: 0,
})

const initData = {}
initData.search = {
  Type: null,
  Title: null,
  Tags: [],
  CreateDateStart: null,
  CreateDateEnd: null,
  Status: null,
}
const search = reactive(cloneDeep(initData.search))

const searchSubmit = () => {
  GetArticle()
}

const searchClear = () => {
  Object.assign(search, cloneDeep(initData.search))
  GetArticle()
}

const toCreate = () => {
  router.push({ name: 'CreateArticle' })
}

const toEdit = (item) => {
  router.push({ name: 'CreateArticle', params: { _id: item._id } })
}

const toPreview = (item) => {
  router.push({ name: 'ArticlePreview', params: { _id: item._id } })
}

const toDelete = () =>{
  
}

const PostArticlePublish = (item) => {
  $q.dialog({
    message: '是否確定發布此文章？',
    ok: { label: '發布文章', color: 'primary', unelevated: true },
    cancel: { label: '取消', color: 'grey', unelevated: true },
  }).onOk(async () => {
    const { error } = await postArticlePublish(item._id)
    if (!error) item.StatusId = 10
    $q.notify({
      type: error ? 'negative' : 'positive',
      message: '發布文章' + (error ? '失敗' : '成功'),
      position: 'top',
    })
  })
}

const PostArticleUnpublish = (item) => {
  $q.dialog({
    message: '是否確定取消發布此文章？',
    ok: { label: '取消發布文章', color: 'primary', unelevated: true },
    cancel: { label: '取消', color: 'grey', unelevated: true },
  }).onOk(async () => {
    const { error } = await postArticleUnpublish(item._id)
    if (!error) item.StatusId = 0
    $q.notify({
      type: error ? 'negative' : 'positive',
      message: '取消發布文章' + (error ? '失敗' : '成功'),
      position: 'top',
    })
  })
}

const getImageSrc = (image) => {
  return image && image.Thumb.BasePath
    ? `https://firebasestorage.googleapis.com/v0/b/mrgreen-dbf25.appspot.com/o/${image.Thumb.BasePath}?alt=media`
    : null
}

const init = () => {
  GetArticle()
}
init()
</script>

