import isValidSearchValue from './isValidSearchValue.js'
import { isArray } from 'lodash-es'

const setSearchQuery = (queryOptions) => {
  if (!queryOptions) return ''

  const queryArr = Object.entries(queryOptions)
    .filter(([_, value]) => isValidSearchValue(value))
    .map(([key, value]) => {
      if (isArray(value)) return value.map((item) => `${key}=${item}`)
      else return `${key}=${value}`
    })
    .flat()

  return queryArr.length > 0 ? '?' + queryArr.join('&') : ''
}

export default setSearchQuery

