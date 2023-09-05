<template>
  <q-layout view="hHh LpR lFr">
    <q-header>
      <div id="header-expand"></div>
      <q-toolbar v-if="$q.screen.name === 'xs'">
        <q-btn v-bind="QBtnProps" icon="menu" dense @click="drawerShow = true"></q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawerShow" show-if-above bordered>
      <q-list>
        <q-expansion-item
          v-for="(mainItem, mainIndex) in list"
          :key="mainIndex"
          :label="mainItem.label"
          default-opened
          expand-separator
          dense
        >
          <q-list dense>
            <q-item
              v-for="(subItem, subIndex) in mainItem.sublist"
              :key="subIndex"
              :to="subItem.to"
              :active="route.name === subItem.to.name"
              clickable
            >
              <q-item-section>{{ subItem.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.fullPath" />
      </router-view>

      <!-- <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn round color="accent" icon="forum"></q-btn>
      </q-page-sticky> -->
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { QBtnProps } from 'utils/quasar/base-props'
import { computed, ref, provide, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isLayoutMouted = ref(false)
provide('isLayoutMouted', isLayoutMouted)

onMounted(() => {
  isLayoutMouted.value = true
})

const drawerShow = ref(true)

const list = computed(() => {
  const arr = [
    {
      label: '文章',
      sublist: [
        { label: '文章管理', to: { name: 'Article' } },
        { label: '文章類別管理', to: { name: 'ArticleTypeManage' } },
      ],
    },
    {
      label: '植物',
      sublist: [
        { label: '植物管理', to: { name: 'Plant' } },
        { label: '科名及屬名', to: { name: 'TaxonomyManage' } },
      ],
    },
    {
      label: '商品',
      sublist: [
        { label: '商品管理', to: { name: 'Commodity' } },
        { label: '商品分類管理', to: { name: 'CommodityTypeManage' } },
      ],
    },
    {
      label: '標籤',
      sublist: [{ label: '標籤管理', to: { name: 'TagManage' } }],
    },
    {
      label: '倉儲',
      sublist: [
        { label: '倉儲管理', to: { name: 'WarehouseManage' } },
        { label: '進貨單管理', to: { name: 'PurchaseOrderManage' } },
        { label: '規格群組與規格管理', to: { name: 'SkuGroupAndSkuManage' } },
      ],
    },
    {
      label: '其他',
      sublist: [
        { label: '收入與支出', to: { name: 'IncomeAndExpense' } },
        { label: '庫存紀錄管理', to: { name: 'StockRecordManage' } },
        { label: '聯絡人管理', to: { name: 'ContactManage' } },
      ],
    },
    {
      label: '工作',
      sublist: [
        { label: '工作日誌', to: { name: 'WorkRecordManage' } },
        { label: '工作施作管理', to: { name: 'WorkEventManage' } },
      ],
    },
  ]

  return arr
})
</script>

<style lang="scss">
.q-page-sticky {
  z-index: 999;
}
</style>

