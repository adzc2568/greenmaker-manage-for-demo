<template>
  <q-page>
    <article id="my-article" class="p-4">
      <h1>{{ articleStore.article.Title }}</h1>
      <ul>
        <li v-for="(tagName, index) in articleStore.article.TagNames" :key="index">
          <q-chip>{{ tagName }}</q-chip>
        </li>
      </ul>

      <q-separator></q-separator>

      <q-img src="https://picsum.photos/1920/1080"></q-img>

      <article-contents
        :contents="articleStore.article.Contents"
        :images="articleStore.article.Images"
      ></article-contents>
    </article>
  </q-page>
</template>

<script setup>
import { reactive } from 'vue'
import { useRoute } from 'vue-router'
import ArticleContents from './components/ArticleContents.js'
import { getArticleItem } from 'api'

const route = useRoute()

const article = reactive({
  _id: null,
  Title: null,
  UrlTitle: null,

  TypeId: null,
  TypeName: null,

  TagIds: [],
  TagNames: [],

  Content: [],
  Summary: null,

  ImageIds: [],
  Images: [],
})
const GetArticleItem = async () => {
  const { data } = await getArticleItem(route.query._id)
  Object.assign(article, data)
}
/*



*/
const init = () => {
  GetArticleItem()
}
init()
</script>

<style lang="scss">
#my-article {
  h1 {
    @apply text-4xl font-bold;
  }
  > * {
    @apply mb-4;
  }
}
</style>

