import { isArray, isString, isNumber, isBoolean } from 'lodash-es'

const isValidSearchValue = (value) => {
  if ((isString(value) && !!value) || isNumber(value) || isBoolean(value) || (isArray(value) && value.length > 0)) {
    return true
  } else {
    return false
  }
}

export default isValidSearchValue

