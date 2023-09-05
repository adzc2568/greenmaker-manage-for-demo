<template>
  <q-page class="p-4">
    <q-tabs v-model="currentTab" active-color="primary" align="left">
      <q-tab v-for="tab in tabs" :key="tab.value" :name="tab.value" :label="tab.label"></q-tab>
    </q-tabs>

    <q-tab-panels v-model="currentTab" keep-alive>
      <q-tab-panel v-for="tab in tabs" :name="tab.value" :key="tab.value">
        <common-data-manage v-bind="tab.bind"></common-data-manage>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import CommonDataManage from '../CommonData/CommonDataManage.vue'

const tabs = [
  { label: '科名', value: 'Family', bind: { wrapperType: 'div', category: 'TaxonomyFamily', title: '科名' } },
  { label: '屬名', value: 'Genus', bind: { wrapperType: 'div', category: 'TaxonomyGenus', title: '屬名' } },
]
const currentTab = ref(tabs[0].value)
</script>

