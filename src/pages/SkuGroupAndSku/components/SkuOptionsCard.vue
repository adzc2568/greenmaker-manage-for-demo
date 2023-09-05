<template>
  <q-card flat bordered>
    <q-card-section class="flex gap-2">
      <div class="text-xl font-bold">規格表</div>
      <q-space></q-space>
      <slot name="btn-append"></slot>
      <q-btn v-bind="QBtnProps" label="新增規格" color="secondary" @click="toCreate"></q-btn>
    </q-card-section>
    <q-card-section v-if="options.length === 0">
      <q-icon name="warning" class="mr-4" size="sm"></q-icon>
      <span class="text-xs">沒有資料</span>
    </q-card-section>
    <q-card-section v-else class="grid grid-cols-4 gap-2">
      <my-edit-card
        v-for="(option, index) in options"
        :key="option.Name"
        :menu="menu"
        @menu-click="(fn) => fn(option, index)"
        class="flex-center flex"
        :readonly="readonly"
      >
        <q-card-section>
          <div>規格名稱：{{ option.Name }}</div>
          <div>規格項目：</div>
          <q-chip v-for="item in option.Items" :key="item">{{ item }}</q-chip>
        </q-card-section>
      </my-edit-card>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { QBtnProps } from 'utils/quasar/base-props'
import SkuOptionsEdit from './SkuOptionsEdit.vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },

  readonly: Boolean,
})

const emit = defineEmits(['update:options'])

const menu = [
  { label: '編輯', icon: 'edit', fn: (item, index) => toEdit(item, index) },
  { label: '刪除', icon: 'delete', fn: (item, index) => toDelete(item, index) },
]

const toCreate = () => {
  $q.dialog({
    component: SkuOptionsEdit,
    componentProps: {
      editType: 'add',
    },
  }).onOk((option) => {
    emit('update:options', props.options.concat(option))
  })
}

const toEdit = (item, index) => {
  $q.dialog({
    component: SkuOptionsEdit,
    componentProps: {
      editType: 'edit',
      data: item,
    },
  }).onOk((option) => {
    emit('update:options', props.options.with(index, option))
  })
}

const toDelete = (item, index) => {
  $q.dialog({
    component: SkuOptionsEdit,
    componentProps: {
      editType: 'delete',
      data: item,
    },
  }).onOk(() => {
    emit('update:options', props.options.toSpliced(index, 1))
  })
}
</script>

