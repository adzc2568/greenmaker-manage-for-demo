import { cloneDeep } from 'lodash-es'

export const initSkus = [
  {
    SkuOptions: [
      {
        OptionName: '無規格',
        OptionValue: '無規格',
      },
    ],
    Stock: 0,
  },
]

export const skusGenerate = (warehouseOptions) => {
  if (warehouseOptions.length === 0) {
    return cloneDeep(initSkus)
  }

  let skus = []
  warehouseOptions.forEach((option, index) => {
    if (index === 0) {
      skus = option.Items.map((item) => ({ SkuOptions: [{ OptionName: option.Name, OptionValue: item }] }))
    } else {
      skus = skus
        .map((sku) => {
          return option.Items.map((item) => ({
            SkuOptions: [...sku.SkuOptions, { OptionName: option.Name, OptionValue: item }],
          }))
        })
        .flat()
    }
  })

  return skus.map((sku) => ({ ...sku, Stock: 0 }))
}

export const getSkuName = (skuOptions, format = false) => {
  const blank = format ? ' ' : ''
  if (skuOptions.length === 1 && skuOptions[0].OptionValue === '無規格') return '無規格'
  else return skuOptions.map(({ OptionName, OptionValue }) => OptionName + `:${blank}` + OptionValue).join(`,${blank}`)
}

