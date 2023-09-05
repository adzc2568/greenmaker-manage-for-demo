import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    adminName: sessionStorage.getItem('adminName'),
    blockAdminName: false, // 某些狀況下，禁止變更 adminName，如：新增/編輯文章
  }),
  actions: {
    setAdminName(adminName) {
      this.adminName = adminName
    },
    setBlockAdminName(boolean) {
      this.blockAdminName = boolean
    },
  },
})

