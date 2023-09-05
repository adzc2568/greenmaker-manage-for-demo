import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'

const api = axios.create({
  baseURL: process.env.API_HOST + '/api',
  timeout: 720 * 1000,
})

export default boot(({ router }) => {
  api.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem('token')

      if (token !== null) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => {
      return Promise.resolve({ error })
    }
  )

  api.interceptors.response.use(
    (response) => {
      return Promise.resolve(response)
    },
    (error) => {
      if (error.response.status === 401) {
        router.replace({ name: 'SignIn' })
      }
      Notify.create({
        type: 'negative',
        position: 'top',
        message: error.response.data?.message || error.message,
      })
      return Promise.resolve({ error })
    }
  )
})

export const getArticle = (query = '') => api.get(`/article${query}`)
export const getArticleItem = (_id) => api.get(`/article/${_id}`)
export const postArticleItem = (body) => api.post(`/article`, body)
export const putArticleItem = (body) => api.put(`/article`, body)
export const deleteArticleItem = (_id) => api.delete(`/article/${_id}`)
export const postArticlePublish = (_id) => api.post(`/article/publish/${_id}`)
export const postArticleUnpublish = (_id) => api.post(`/article/unpublish/${_id}`)

export const getCommonList = (category) => api.get(`/list/${category}`)
export const getCommonData = (query = '') => api.get(`/common-data${query}`)
export const getCommonDataItem = (_id) => api.get(`/common-data/${_id}`)
export const postCommonDataItem = (body) => api.post(`/common-data`, body)
export const putCommonDataItem = (body) => api.put(`/common-data`, body)
export const deleteCommonDataItem = (_id) => api.delete(`/common-data/${_id}`)

export const postUploadTempImage = (formdata) => api.post(`/image/upload-temp`, formdata)
export const postCropTempImage = (body) => api.post(`/image/crop-temp`, body)

export const getIncome = (query = '') => api.get(`/income${query}`)
export const getIncomeItem = (_id) => api.get(`/income/${_id}`)
export const postIncomeItem = (body) => api.post(`/income`, body)
export const putIncomeItem = (body) => api.put(`/income`, body)
export const deleteIncomeItem = (_id) => api.delete(`/income/${_id}`)

export const getExpense = (query = '') => api.get(`/expense${query}`)
export const getExpenseItem = (_id) => api.get(`/expense/${_id}`)
export const postExpenseItem = (body) => api.post(`/expense`, body)
export const putExpenseItem = (body) => api.put(`/expense`, body)
export const deleteExpenseItem = (_id) => api.delete(`/expense/${_id}`)

export const getPlant = (query = '') => api.get(`/plant${query}`)
export const getPlantItem = (_id) => api.get(`/plant/${_id}`)
export const postPlantItem = (body) => api.post(`/plant`, body)
export const putPlantItem = (body) => api.put(`/plant`, body)
export const deletePlantItem = (_id) => api.delete(`/plant/${_id}`)

export const getCommodity = (query = '') => api.get(`/commodity${query}`)
export const getCommodityItem = (_id) => api.get(`/commodity/${_id}`)
export const postCommodityItem = (body) => api.post(`/commodity`, body)
export const putCommodityItem = (body) => api.put(`/commodity`, body)
export const deleteCommodityItem = (_id) => api.delete(`/commodity/${_id}`)
export const putChangeCommodityStatus = (body) => api.put(`/ChangeCommodityStatus`, body)

export const getWarehouse = (query = '') => api.get(`/warehouse${query}`)
export const getWarehouseItem = (_id) => api.get(`/warehouse/${_id}`)
export const postWarehouseItem = (body) => api.post(`/warehouse`, body)
export const putWarehouseItem = (body) => api.put(`/warehouse`, body)
export const deleteWarehouseItem = (_id) => api.delete(`/warehouse/${_id}`)
export const postWarehouseStockMove = (body) => api.post(`/warehouse/stock-move`, body)
export const putWarehouseStockUpdate = (body) => api.put(`/warehouse/stock-update`, body)

export const getPurchaseOrder = (query = '') => api.get(`/purchase-order${query}`)
export const getPurchaseOrderItem = (_id) => api.get(`/purchase-order/${_id}`)
export const postPurchaseOrderItem = (body) => api.post(`/purchase-order`, body)
export const putPurchaseOrderItem = (body) => api.put(`/purchase-order`, body)
export const deletePurchaseOrderItem = (_id) => api.delete(`/purchase-order/${_id}`)

export const getContact = (query = '') => api.get(`/contact${query}`)
export const getContactItem = (_id) => api.get(`/contact/${_id}`)
export const postContactItem = (body) => api.post(`/contact`, body)
export const putContactItem = (body) => api.put(`/contact`, body)
export const deleteContactItem = (_id) => api.delete(`/contact/${_id}`)

export const getStockRecord = (query = '') => api.get(`/stock-record${query}`)

export const getWeather = (query = '') => api.get(`/weather${query}`)
export const getWeatherItem = (_id) => api.get(`/weather/${_id}`)
export const postWeatherItem = (body) => api.post(`/weather`, body)
export const putWeatherItem = (body) => api.put(`/weather`, body)
export const deleteWeatherItem = (_id) => api.delete(`/weather/${_id}`)

export const getWorkRecord = (query = '') => api.get(`/work-record${query}`)
export const getWorkRecordItem = (_id) => api.get(`/work-record/${_id}`)
export const postWorkRecordItem = (body) => api.post(`/work-record`, body)
export const putWorkRecordItem = (body) => api.put(`/work-record`, body)
export const deleteWorkRecordItem = (_id) => api.delete(`/work-record/${_id}`)

export const getSku = (query = '') => api.get(`/sku${query}`)
export const getSkuItem = (_id) => api.get(`/sku/${_id}`)
export const postSkuItem = (body) => api.post(`/sku`, body)
export const putSkuItem = (body) => api.put(`/sku`, body)
export const deleteSkuItem = (_id) => api.delete(`/sku/${_id}`)

export const getSkuGroup = (query = '') => api.get(`/sku-group${query}`)
export const getSkuGroupItem = (_id) => api.get(`/sku-group/${_id}`)
export const postSkuGroupItem = (body) => api.post(`/sku-group`, body)
export const putSkuGroupItem = (body) => api.put(`/sku-group`, body)
export const deleteSkuGroupItem = (_id) => api.delete(`/sku-group/${_id}`)

export const getLatestAndNotReadedMessage = () => api.get(`/message/latest-and-not-readed-message`)

