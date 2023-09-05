<template>
  <q-card>
    <q-card-section>
      <div class="flex-center flex gap-2">
        <q-space></q-space>
        <q-btn
          v-bind="QBtnProps"
          label="上一年"
          color="primary"
          :disable="preYearDisable"
          @click="setYear(year - 1)"
        ></q-btn>
        <q-btn v-bind="QBtnProps" label="上個月" color="primary" :disable="preMonthDisable" @click="preMonth"></q-btn>

        <q-btn v-bind="QBtnProps" :label="year + ' 年'" color="purple">
          <q-popup-proxy :ref="(el) => (popupProxyRefs.year = el)" @hide="yearDiff = 0">
            <q-card>
              <q-card-section class="flex">
                <q-btn
                  v-bind="QBtnProps"
                  icon="chevron_left"
                  @click="yearDiff--"
                  :disable="yearItems[0].value === 0"
                ></q-btn>
                <div class="grid grid-cols-3">
                  <q-btn
                    v-bind="QBtnProps"
                    v-for="yearItem in yearItems"
                    :key="yearItem.value"
                    :label="yearItem.label"
                    :outline="year === yearItem.value"
                    @click="yearSelect(yearItem.value)"
                  ></q-btn>
                </div>
                <q-btn v-bind="QBtnProps" icon="chevron_right" @click="yearDiff++"></q-btn>
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </q-btn>
        <q-btn v-bind="QBtnProps" :label="month + ' 月'" color="green">
          <q-popup-proxy :ref="(el) => (popupProxyRefs.month = el)">
            <q-card>
              <q-card-section class="grid grid-cols-3">
                <q-btn
                  v-bind="QBtnProps"
                  v-for="monthItem in monthItems"
                  :key="monthItem.value"
                  :label="monthItem.label"
                  :outline="month === monthItem.value"
                  @click="monthSelect(monthItem.value)"
                ></q-btn>
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </q-btn>
        <q-btn v-if="mode === 'list'" v-bind="QBtnProps" :label="weekSelectLabel" color="cyan">
          <q-popup-proxy :ref="(el) => (popupProxyRefs.week = el)">
            <q-card>
              <q-card-section class="grid">
                <q-btn
                  v-bind="QBtnProps"
                  v-for="(weekItem, index) in chunkCalendarDates"
                  :key="index"
                  :label="weekItem[0].format('YYYY-MM-DD') + '~' + weekItem[6].format('YYYY-MM-DD')"
                  :outline="week === index"
                  @click="
                    () => {
                      setWeek(index)
                      popupProxyRefs.week.hide()
                    }
                  "
                ></q-btn>
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </q-btn>

        <q-btn v-bind="QBtnProps" label="下個月" color="primary" @click="nextMonth"></q-btn>
        <q-btn v-bind="QBtnProps" label="下一年" color="primary" @click="setYear(year + 1)"></q-btn>

        <q-space></q-space>
        <q-btn v-bind="QBtnProps" :icon="mode === 'grid' ? 'view_list' : 'grid_view'" @click="setMode"></q-btn>
      </div>

      <div class="mt-2">
        <div class="relative">
          <q-linear-progress v-if="loading" class="absolute" indeterminate></q-linear-progress>
        </div>

        <div v-if="mode === 'grid'" class="grid border">
          <div class="grid grid-cols-7">
            <div
              v-for="(week, index) in weekNameItems"
              :key="index"
              class="border-b p-2 text-center"
              :class="{ 'border-r': index % 7 < 6 }"
            >
              {{ week.CName }}
            </div>
          </div>
          <div
            v-for="(week, weekIndex) in chunkCalendarDates"
            :key="weekIndex"
            class="relative grid h-[180px] grid-cols-7 border-b"
          >
            <div
              v-for="(date, dateIndex) in week"
              :key="dateIndex"
              class="no-wrap z-10 flex flex-col border-r"
              :class="{ 'border-r': dateIndex % 7 < 6 }"
            >
              <div class="flex p-2 pb-0" :class="{ 'text-gray-500': date.month() + 1 !== month }">
                <div>{{ date.date() }}</div>
                <q-space></q-space>
                <slot
                  :name="`${date.format('YYYY-MM-DD')}-append`"
                  :date="date"
                  :weekIndex="weekIndex"
                  :dateIndex="dateIndex"
                ></slot>
              </div>
              <slot :name="date.format('YYYY-MM-DD')" :date="date" :weekIndex="weekIndex" :dateIndex="dateIndex"></slot>
            </div>
            <slot :name="`weather-${weekIndex}`"></slot>
          </div>
        </div>
        <div v-if="mode === 'list'" class="grid border">
          <div
            v-for="(date, dateIndex) in chunkCalendarDates[week]"
            :key="dateIndex"
            class="grid h-[180px] grid-cols-12 border-b last:border-b-0"
          >
            <div class="border-r p-2">
              <div>{{ weekNameItems[dateIndex].CName }}</div>
              <div class="flex items-center justify-between">
                <div>{{ date.date() }}</div>
                <slot
                  :name="`${date.format('YYYY-MM-DD')}-append`"
                  :date="date"
                  :weekIndex="week"
                  :dateIndex="dateIndex"
                ></slot>
              </div>
            </div>
            <div class="relative col-span-11">
              <slot :name="date.format('YYYY-MM-DD')" :date="date" :weekIndex="week" :dateIndex="dateIndex"></slot>
              <slot :name="`weather-${dateIndex}`"></slot>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { monthItems, weekNameItems } from 'assets/options.js'
import { useCalendar } from 'utils/use-calendar.js'
import { QBtnProps } from 'src/utils/quasar/base-props'
import { chunk } from 'lodash-es'

const props = defineProps({
  loading: Boolean,
})

const week = ref(0)
const weekSelectLabel = computed(() => {
  return (
    chunkCalendarDates.value[week.value][0].format('YYYY-MM-DD') +
    '~' +
    chunkCalendarDates.value[week.value][6].format('YYYY-MM-DD')
  )
})
const mode = ref('grid')

const emit = defineEmits(['calendar-update', 'mode-update'])
const popupProxyRefs = reactive({})

const { year, month, firstDate, endDate, calendarDates, setYear, setMonth } = useCalendar()
const chunkCalendarDates = computed(() => chunk(calendarDates.value, 7))

const yearDiff = ref(0)
const yearItems = computed(() => {
  const startYear = Math.floor((year.value + 20 * yearDiff.value) / 20) * 20

  return Array.from(new Array(21)).map((_, index) => {
    const value = startYear + index
    return {
      label: value + ' 年',
      value,
    }
  })
})

const changeDate = (date) => {
  if (date.year) setYear(date.year)
  if (date.month) setMonth(date.month)
  emit('calendar-update', { year, month })
}

const yearSelect = (val) => {
  if (year.value !== val) changeDate({ year: val })
  popupProxyRefs.year.hide()
}

const monthSelect = (val) => {
  if (month.value !== val) changeDate({ month: val })
  popupProxyRefs.month.hide()
}

const preMonth = () => {
  if (month.value === monthItems[0].value) {
    changeDate({ year: year.value - 1, month: 12 })
  } else {
    changeDate({ month: month.value - 1 })
  }
}

const nextMonth = () => {
  if (month.value === monthItems[11].value) {
    changeDate({ year: year.value + 1, month: 1 })
  } else {
    changeDate({ month: month.value + 1 })
  }
}

const preYearDisable = computed(() => year.value === 0)
const preMonthDisable = computed(() => preYearDisable.value && month.value === monthItems[0].value)

const setWeek = (index) => {
  week.value = index
}

const setMode = () => {
  if (mode.value === 'grid') mode.value = 'list'
  else if (mode.value === 'list') mode.value = 'grid'
  emit('mode-update', mode.value)
}

defineExpose({
  year,
  month,
  week: computed(() => week.value),
  firstDate,
  endDate,
  mode: computed(() => mode.value),
})
</script>

