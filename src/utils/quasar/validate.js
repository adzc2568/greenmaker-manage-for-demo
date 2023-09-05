export const validate = (inputRefs) => {
  const validationArr = Object.entries(inputRefs)
    .filter(([_, inputRef]) => inputRef)
    .map(([_, inputRef]) => {
      const data = { result: inputRef.validate() }
      if (!data.result) data.errorInputRef = inputRef
      return data
    })

  const validationFail = validationArr.find((item) => !item.result)

  if (validationFail === undefined) return { result: true }
  else return validationFail
}

