import { reactive, onUnmounted, computed } from 'vue'
import { getCommonList } from 'api'

const allList = reactive({})
const using = reactive({})
const tasks = {}

const taskHandler = (task, key) => {
  tasks[key] = task
  return Promise.resolve(task).then(({ data }) => {
    if (task === tasks[key]) {
      allList[key] = data
      tasks[key] = undefined
    }
  })
}

export const useList = (listKeys, callback) => {
  const list = listKeys.reduce((obj, key) => {
    obj[key] = computed(() => allList[key] || [])
    return obj
  }, {})

  const checkIsComplete = () => {
    return listKeys.filter((key) => allList[key] === undefined).length === 0
  }

  let isComplete = false
  listKeys.forEach(async (key) => {
    if (using[key]) using[key]++
    else using[key] = 1

    if (!tasks[key]) {
      await taskHandler(getCommonList(key), key)
      if (!isComplete && checkIsComplete()) {
        isComplete = true
        if (typeof callback === 'function') {
          callback()
        }
      }
    }
  })

  onUnmounted(() => {
    listKeys.forEach((key) => {
      using[key]--

      if (using[key] === 0) {
        allList[key] = undefined
        using[key] = undefined
        tasks[key] = undefined
      }
    })
  })

  return list
}

useList.regetList = (listKeys) => {
  listKeys.forEach((key) => {
    if (using[key] && allList[key]) {
      taskHandler(getCommonList(key), key)
    }
  })
}

