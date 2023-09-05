<template>
  <q-dialog ref="dialogRef" full-width no-backdrop-dismiss @hide="onHide">
    <my-dialog-content class="self-start" :header="header" @close="onDialogCancel">
      <q-card flat bordered>
        <q-card-section>
          <my-search-area @searchSubmit="searchSubmit" @searchClear="searchClear">
            <my-filter-select v-bind="QSelectProps" v-model="search.Family" label="科名" list-key="TaxonomyFamily">
            </my-filter-select>
            <my-filter-select v-bind="QSelectProps" v-model="search.Genus" label="屬名" list-key="TaxonomyGenus">
            </my-filter-select>
            <q-input v-bind="QInputProps" v-model="search.ScientificName" label="學名"></q-input>
            <q-input v-bind="QInputProps" v-model="search.BusinessName" label="商業名稱"></q-input>
          </my-search-area>
        </q-card-section>
        <q-card-section class="pt-0">
          <div ref="cardContainerRef" class="my-plant grid grid-cols-6 gap-4">
            <q-card
              v-for="plant in items"
              :key="plant._id"
              :id="plant._id"
              class="bg-grey-1 cursor-pointer"
              flat
              @click="onSelect(plant)"
            >
              <div class="bg-brown-11 flex items-center justify-center overflow-hidden">
                <q-img :src="plant.Images?.[0]?.FullPath" :img-style="{ margin: 'auto' }"></q-img>
              </div>
              <q-card-section class="flex gap-2">
                <div>{{ plant.BusinessName }}{{ plant.ScientificName ? `（${plant.ScientificName}）` : null }}</div>
              </q-card-section>
              <q-card-section>{{ plant.Description }}</q-card-section>

              <transition>
                <div
                  v-if="selected && selected.find((item) => item._id === plant._id)"
                  class="bg-green-1 flex-center absolute left-0 right-0 top-0 flex h-full w-full opacity-80"
                >
                  <q-icon name="done" size="xl" color="green"></q-icon>
                </div>
              </transition>
            </q-card>
          </div>
        </q-card-section>
      </q-card>

      <template #actions>
        <q-btn v-bind="QBtnProps" color="grey" label="取消" @click="onDialogCancel" />
        <q-btn v-bind="QBtnProps" color="primary" label="匯入" @click="onSaveClick" />
      </template>
    </my-dialog-content>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { QInputProps, QSelectProps, QBtnProps } from 'utils/quasar/base-props'
import { getPlant } from 'api'
import { cloneDeep } from 'lodash-es'
import setSearchQuery from 'utils/setSearchQuery.js'
import { baseOptions } from '../common/options.js'
import { skusGenerate } from 'utils/skus.js'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const $q = useQuasar()

const selected = ref([])

const loading = ref(false)
const items = ref([])
const GetPlant = async () => {
  loading.value = true

  const query = setSearchQuery({
    limit: pagination.rowsPerPage,
    skip: skip.value,
    ...search,
  })

  const { data } = await getPlant(query)

  if (data) {
    items.value = data.Items
    pagination.rowsNumber = data.Count
  }

  loading.value = false
}

const pagination = reactive({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const skip = computed(() => (pagination.page - 1) * pagination.rowsPerPage)

const initData = {}
initData.search = {
  Family: null,
  Genus: null,
  ScientificName: null,
  BusinessName: null,
}
const search = reactive(cloneDeep(initData.search))

const searchSubmit = () => {
  GetPlant()
}

const searchClear = () => {
  Object.assign(search, initData.search)
  GetPlant()
}

const onSelect = (plant) => {
  const index = selected.value.findIndex((item) => item._id === plant._id)
  if (index !== -1) selected.value = selected.value.slice(0, index).concat(selected.value.slice(index + 1))
  else selected.value = [...selected.value, plant]
}

const header = '從植物匯入'

const callApi = async (param) => {
  const { error } = await postWarehouseStockMove(param)

  $q.notify({
    type: error ? 'negative' : 'positive',
    message: header + (error ? '失敗' : '成功'),
    position: 'top',
  })

  return { error }
}

const onSaveClick = async () => {
  const tasks = selected.value.map((plant) => {
    const options = baseOptions.plant
    const editItem = {
      Type: 'plant',
      Name: plant.BusinessName,
      Options: options,
      Skus: skusGenerate(options),
    }

    return callApi(editItem)
  })

  const res = await Promise.all(tasks)

  const error = res.find(({ error }) => error)?.error

  if (!error) onDialogOK(selected.value)
}

const init = () => {
  GetPlant()
}
init()
</script>

