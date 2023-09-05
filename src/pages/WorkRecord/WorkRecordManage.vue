<template>
  <q-page>
    <my-calendar ref="myCalendarRef" @calendar-update="onCalendarUpdate" :loading="loading">
      <template v-for="(item, index) in chartItems" :key="index" #[`weather-${index}`]>
        <div
          v-if="chartShow[index]"
          class="absolute left-0 top-0 z-0 h-full w-full"
          :style="`width:calc((100% / 7) * ${item.length})`"
        >
          <WeatherChart :weather-datas="item.weatherDatas" width="100%" height="100%"></WeatherChart>
        </div>
      </template>

      <template v-for="item in weatherItems" :key="item._id" #[`${getDateFormat(item.Date)}-append`]="{ weekIndex }">
        <q-icon
          class="cursor-pointer"
          name="sunny"
          size="sm"
          @mouseenter="weatherMouseenter(weekIndex)"
          @mouseout="weatherMouseout(weekIndex)"
        ></q-icon>
      </template>
      <template v-for="(date, index) in canEditDateRange" :key="index" #[getDateFormat(date)]="{ weekIndex }">
        <div v-if="!chartShow[weekIndex]" class="h-full">
          <div
            v-if="workRecordObjByDate[getDateFormat(date)]"
            class="relative h-full p-2"
            @mouseenter="onItemMouseenter(getDateFormat(date))"
            @mouseleave="onItemMouseleave(getDateFormat(date))"
          >
            <div class="text-left">
              <div>
                <q-chip
                  v-for="workEventName in workRecordObjByDate[getDateFormat(date)].WorkEventNames"
                  :key="workEventName"
                  :label="workEventName"
                  dense
                ></q-chip>
              </div>
              <div class="line-clamp-4">
                {{ workRecordObjByDate[getDateFormat(date)].Content }}
              </div>
            </div>
            <transition name="opacity">
              <div
                v-if="menuShow[getDateFormat(date)]"
                class="absolute bottom-0 left-0 right-0 top-0 z-10 bg-[#eceff188]"
              >
                <div class="flex-center flex h-full">
                  <q-btn
                    v-for="menuItem in menu"
                    v-bind="QBtnProps"
                    :key="menuItem.icon"
                    :icon="menuItem.icon"
                    round
                    @click="menuItem.fn(workRecordObjByDate[getDateFormat(date)])"
                  >
                    <q-tooltip>
                      {{ menuItem.label }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </transition>
          </div>
          <q-btn
            v-else
            v-bind="QBtnProps"
            icon="add"
            text-color="secondary"
            class="h-full w-full"
            @click="toAdd(date)"
          ></q-btn>
        </div>
      </template>
    </my-calendar>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, computed, ref, watch } from 'vue'
import MyCalendar from 'components/MyCalendar.vue'
import { getWeather, getWorkRecord } from 'boot/api'
import setSearchQuery from 'utils/setSearchQuery'
import dayjs from 'dayjs'
import WeatherChart from './components/WeatherChart.vue'
import { chunk, range } from 'lodash-es'
import { useQuasar } from 'quasar'
import { useList } from 'utils/use-list'
import WorkRecordEdit from './components/WorkRecordEdit.vue'
import { QBtnProps } from 'utils/quasar/base-props'

const $q = useQuasar()
const myCalendarRef = ref()
const menuShow = reactive({})
const chartShow = reactive({})

const menu = [
  { label: '編輯', icon: 'edit', fn: (item) => toEdit(item) },
  { label: '刪除', icon: 'delete', fn: (item) => toDelete(item) },
]

const onItemMouseenter = (date) => {
  menuShow[date] = true
}
const onItemMouseleave = (date) => {
  menuShow[date] = false
}

const currentYearMonthDayjs = computed(() => {
  if (myCalendarRef.value) {
    const yyyymm =
      myCalendarRef.value.year +
      '-' +
      (myCalendarRef.value.month < 10 ? `0${myCalendarRef.value.month}` : myCalendarRef.value.month)

    return dayjs(yyyymm)
  } else {
    return dayjs()
  }
})

const chartItems = computed(() => {
  if (myCalendarRef.value?.mode === 'grid') {
    return weekWeatherItems.value.map((week) => ({
      weatherDatas: week.map(({ WeatherDatas }) => WeatherDatas).flat(),
      length: week.length,
    }))
  } else if (myCalendarRef.value?.mode === 'list') {
    const weekWeather = weekWeatherItems.value[myCalendarRef.value.week] || []
    return weekWeather.map((date) => ({
      weatherDatas: date.WeatherDatas,
      length: 7,
    }))
  } else {
    return []
  }
})

const getDateFormat = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const weatherMouseenter = (weekIndex) => {
  if (myCalendarRef.value.mode === 'grid') {
    if (chartShow[weekIndex]) return
    chartShow[weekIndex] = true
  } else if (myCalendarRef.value.mode === 'list') {
    if (chartShow[weekIndex]) return
    for (let i = 0; i < 7; i++) {
      chartShow[i] = true
    }
  }
}
const weatherMouseout = (weekIndex) => {
  if (myCalendarRef.value.mode === 'grid') {
    chartShow[weekIndex] = false
  } else if (myCalendarRef.value.mode === 'list') {
    for (let i = 0; i < 7; i++) {
      chartShow[i] = false
    }
  }
}

const weekWeatherItems = computed(() => chunk(weatherItems.value, 7))
const weatherItems = ref([])
const GetWeather = async () => {
  const query = setSearchQuery({
    Date: [
      'gte:' + myCalendarRef.value.firstDate.format('YYYY-MM-DD'),
      'lte:' + myCalendarRef.value.endDate.format('YYYY-MM-DD'),
    ],
  })
  const { data } = await getWeather(query)
  if (data) {
    weatherItems.value = data.Items
  }
}

const workRecordObjByDate = computed(() =>
  workRecordItems.value.reduce((obj, item) => {
    const date = dayjs(item.RecordDate).format('YYYY-MM-DD')
    if (!obj[date]) obj = { ...obj, [date]: item }
    return obj
  }, {})
)
const workRecordItems = ref([])
const GetWorkRecord = async () => {
  const yyyymm = currentYearMonthDayjs.value.format('YYYY-MM')
  const query = setSearchQuery({
    Date: ['gte:' + `${yyyymm}-01`, 'lte:' + `${yyyymm}-${dayjs(yyyymm).daysInMonth()}`],
  })
  const { data } = await getWorkRecord(query)
  if (data) {
    workRecordItems.value = data.Items
  }
}

const toAdd = (date) => {
  $q.dialog({
    component: WorkRecordEdit,
    componentProps: {
      editType: 'add',
      data: {
        RecordDate: date.format('YYYY-MM-DD'),
        WorkEventIds: [],
        Content: null,
      },
    },
  }).onOk(() => {
    GetWorkRecord()
  })
}

const toEdit = (item) => {
  $q.dialog({
    component: WorkRecordEdit,
    componentProps: {
      editType: 'edit',
      data: item,
    },
  }).onOk(() => {
    GetWorkRecord()
  })
}

const toDelete = (item) => {
  $q.dialog({
    component: WorkRecordEdit,
    componentProps: {
      editType: 'delete',
      data: item,
    },
  }).onOk(() => {
    GetWorkRecord()
  })
}

const onCalendarUpdate = () => {
  weatherItems.value = []
  init()
}

const canEditDateRange = ref([])
const setCanEditDateRange = () => {
  if (myCalendarRef.value.month > dayjs().month() + 1) return

  const yyyymm = currentYearMonthDayjs.value.format('YYYY-MM')

  canEditDateRange.value = range(
    1,
    (myCalendarRef.value.month < dayjs().month() + 1 ? dayjs(yyyymm).daysInMonth() : dayjs().date()) + 1
  ).map((i) => dayjs(`${yyyymm}-${i}`))
}

const listKeys = ['WorkEvent']
const { WorkEvent: WorkEventItems } = useList(listKeys)

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

const loading = ref(true)
const init = async () => {
  loading.value = true

  const initData = async () => {
    await Promise.all([GetWeather(), GetWorkRecord(), setCanEditDateRange()])
    loading.value = false
  }

  if (isMounted.value) {
    initData()
  } else {
    const unwatch = watch(isMounted, (val) => {
      if (val) {
        initData()
        unwatch()
      }
    })
  }
}
init()
</script>

