import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

/**
 * @param { Object } options { label: String, type: input, select, ... }
 */
export const required = (options) => [
  (val) =>
    (val !== null && val !== '' && val !== undefined) ||
    `請${options.type === 'select' ? '選擇' : '輸入'}${options.label}`,
]

/**
 * @param { Object } options { title: String, dateRange: [StartDate, EndDate] }
 */
export const useDate = (options) => {
  const ruleArr = [
    (val) => /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(val) || '無效的日期',
    (val) => dayjs(val).isValid() || '無效的日期',
  ]
  if (options?.dateRange) {
    if (options.dateRange[0]) {
      const startDate = dayjs.isDayjs(options.dateRange[0]) ? options.dateRange[0] : dayjs(options.dateRange[0])
      ruleArr.push(
        (val) => dayjs(val).isSameOrAfter(startDate) || `${options.title}不得早於${startDate.format('YYYY-MM-DD')}`
      )
    }
    if (options.dateRange[1]) {
      const endDate = dayjs.isDayjs(options.dateRange[1]) ? options.dateRange[1] : dayjs(options.dateRange[1])
      ruleArr.push(
        (val) => dayjs(val).isSameOrBefore(dayjs(endDate)) || `${options.title}不得超過${endDate.format('YYYY-MM-DD')}`
      )
    }
  }
  return ruleArr
}

