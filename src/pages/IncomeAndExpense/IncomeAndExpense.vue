<template>
  <q-page class="p-4">
    <my-search-area @searchSubmit="searchSubmit" @searchClear="searchClear">
      <my-date-input v-bind="QInputProps" label="開始日期"></my-date-input>
      <my-date-input v-bind="QInputProps" label="結束日期"></my-date-input>
    </my-search-area>

    <q-card flat bordered>
      <q-card-section>
        <canvas ref="chartRef"></canvas>
      </q-card-section>
    </q-card>

    <div class="mt-4 grid grid-cols-2 items-start gap-2">
      <q-table
        id="income"
        v-bind="QTableProps"
        :columns="getColumns('income')"
        :rows="rows.income"
        :pagination="{ rowsNumber: -1 }"
        :loading="loading.income"
      >
        <template #top>
          <div class="flex w-full items-center">
            <div class="q-table__title">收入列表</div>
            <q-space></q-space>
            <q-btn unelevated color="secondary" @click="toCreate('income')">新增收入</q-btn>
          </div>
        </template>
        <template #body="props">
          <my-edit-row :props="props" :menu="menu" @menu-click="(fn) => fn(props.row, 'income')">
            <template #body-cell-Remark="{ col, value }">
              <q-td :col="col">
                <q-btn v-if="value" v-bind="QBtnProps" icon="more_horiz">
                  <q-tooltip>
                    <pre>{{ value }}</pre>
                  </q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </my-edit-row>
        </template>
      </q-table>

      <q-table
        id="expense"
        v-bind="QTableProps"
        :columns="getColumns('expense')"
        :rows="rows.expense"
        :pagination="{ rowsNumber: -1 }"
        :loading="loading.expense"
      >
        <template #top>
          <div class="flex w-full items-center">
            <div class="q-table__title">支出列表</div>
            <q-space></q-space>
            <q-btn unelevated color="secondary" @click="toCreate('expense')">新增支出</q-btn>
          </div>
        </template>

        <template #body="props">
          <my-edit-row :props="props" :menu="menu" @menu-click="(fn) => fn(props.row, 'expense')">
            <template #body-cell-Remark="{ col, value }">
              <q-td :col="col">
                <pre>{{ value }}</pre>
              </q-td>
            </template>
          </my-edit-row>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch, shallowRef } from 'vue'
import Chart from 'chart.js/auto'
import { QInputProps, QTableProps, QBtnProps } from 'utils/quasar/base-props'
import { monthItems } from 'assets/options.js'
import { useQuasar } from 'quasar'
import { getIncome, getExpense } from 'api'
import IncomeAndExpenseEdit from './components/IncomeAndExpenseEdit.vue'
import setSearchQuery from 'utils/setSearchQuery'
import { cloneDeep } from 'lodash-es'
import dayjs from 'dayjs'
import { getRandomColor, numberFormat } from 'utils/methods.js'

const $q = useQuasar()

const menu = [
  { label: '編輯', icon: 'edit', fn: (item, type) => toEdit(item, type) },
  { label: '刪除', icon: 'delete', fn: (item, type) => toDelete(item, type) },
]

const getColumns = (type) => {
  const typeMap = {
    income: '收入',
    expense: '支出',
  }
  return [
    { name: 'Date', label: '日期', field: (row) => row.Date.substring(0, 10), align: 'left' },
    { name: 'ItemName', label: typeMap[type] + '品項', field: 'ItemName', align: 'left' },
    { name: 'Cost', label: '單價', field: 'Cost', format: numberFormat, align: 'right' },
    { name: 'Amount', label: '數量', field: 'Amount', format: numberFormat, align: 'right' },
    { name: 'Remark', label: '備註', field: 'Remark', align: 'left' },
  ]
}

const loading = reactive({
  income: false,
  expense: false,
})

const rows = reactive({
  income: [],
  expense: [],
})
const GetIncomeOrExpense = async (type) => {
  loading[type] = true

  const query = setSearchQuery(search)
  const getApi = {
    income: getIncome,
    expense: getExpense,
  }

  const { data } = await getApi[type](query)

  if (data) {
    rows[type] = data.Items
  }

  loading[type] = false
}

const initData = {}
initData.search = {}
const search = reactive(cloneDeep(initData.search))

const searchSubmit = async (type) => {
  await GetIncomeOrExpense(type)
  updateChart()
}

const searchClear = () => {
  Object.assign(search, initData.search)
  GetIncomeOrExpense()
}

const toCreate = (type) => {
  $q.dialog({
    component: IncomeAndExpenseEdit,
    componentProps: {
      editType: 'add',
      dataType: type,
    },
  }).onOk(() => {
    searchSubmit(type)
  })
}

const toEdit = (row, type) => {
  $q.dialog({
    component: IncomeAndExpenseEdit,
    componentProps: {
      editType: 'edit',
      dataType: type,
      data: row,
    },
  }).onOk(() => {
    searchSubmit(type)
  })
}

const toDelete = (row, type) => {
  $q.dialog({
    component: IncomeAndExpenseEdit,
    componentProps: {
      editType: 'delete',
      dataType: type,
      data: row,
    },
  }).onOk(() => {
    searchSubmit(type)
  })
}

const chartRef = ref()

const incomeDatasets = computed(() => {
  return rows.income.map((item) => {
    const month = dayjs(item.Date).get('month') + 1
    return {
      label: item.ItemName,
      data: { [`${month} 月`]: item.Cost * item.Amount },
      backgroundColor: getRandomColor(),
      stack: 'income',
    }
  })
})

const expenseDatasets = computed(() => {
  return rows.expense.map((item) => {
    const month = dayjs(item.Date).get('month') + 1
    return {
      label: item.ItemName,
      data: { [`${month} 月`]: item.Cost * item.Amount },
      backgroundColor: getRandomColor(),
      stack: 'expense',
    }
  })
})

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

const chart = shallowRef()
const createChart = () => {
  chart.value = new Chart(chartRef.value, {
    // plugins: [ChartDataLabels],
    type: 'bar',
    data: {
      labels: monthItems.map((item) => item.label),
      datasets: incomeDatasets.value.concat(expenseDatasets.value),
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Chart.js Bar Chart - Stacked',
        },
      },

      responsive: true,
      interaction: {
        intersect: false,
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
    },
  })
}

const updateChart = () => {
  chart.value.data.datasets = incomeDatasets.value.concat(expenseDatasets.value)
  chart.value.update()
}

const init = async () => {
  const tasks = [GetIncomeOrExpense('income'), GetIncomeOrExpense('expense')]
  await Promise.all(tasks)

  if (isMounted.value) {
    createChart()
  } else {
    const unwatch = watch(isMounted, async (val) => {
      if (val) {
        createChart()
        unwatch()
      }
    })
  }
}
init()
</script>

