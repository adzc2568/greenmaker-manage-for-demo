import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export const useCalendar = () => {
  const today = dayjs()
  const year = ref(today.year())
  const month = ref(today.month() + 1)

  const firstMonthDate = computed(() => dayjs(`${year.value}-${month.value}-01`))
  const endMonthDate = computed(() =>
    dayjs(`${year.value}-${month.value}-${dayjs(`${year.value}-${month.value}`).daysInMonth()}`)
  )

  const firstDate = computed(() => firstMonthDate.value.subtract(firstMonthDate.value.$W, 'day'))
  const endDate = computed(() => firstDate.value.add(42, 'day'))

  const calendarDates = computed(() => {
    const calendarArr = Array.from(new Array(42)).map((_, index) => firstDate.value.add(index, 'day'))
    return calendarArr
  })

  const setYear = (y) => {
    year.value = y
  }

  const setMonth = (m) => {
    month.value = m
  }

  return {
    year: computed(() => year.value),
    month: computed(() => month.value),
    calendarDates,
    firstMonthDate,
    endMonthDate,
    firstDate,
    endDate,
    setYear,
    setMonth,
  }
}

