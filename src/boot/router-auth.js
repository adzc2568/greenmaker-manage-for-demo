import { boot } from 'quasar/wrappers'
import { useFirebaseStore } from 'src/stores/firebase'

export default boot(({ router }) => {
  if (process.env.PROD) {
    router.beforeEach(async (to, from, next) => {
      const fsStore = useFirebaseStore()
      if (/^\/Admin/.test(to.path)) {
        const token = sessionStorage.getItem('token')
        if (token === null) {
          next({ name: 'SignIn' })
          return
        }

        if (!(await fsStore.verifyUser())) {
          next({ name: 'SignIn' })
          return
        }
      }

      next()
    })
  }
})

