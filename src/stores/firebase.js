import { defineStore } from 'pinia'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithCredential,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import { Notify } from 'quasar'
import { greenmakerConfig } from 'assets/firebase-config'
import { ref, watch } from 'vue'

export const useFirebaseStore = defineStore('firebase', () => {
  const app = initializeApp(greenmakerConfig, 'greenmaker')
  const auth = getAuth(app)
  const userState = ref('Unknown') // Unknown, SignedIn, SignedOut

  onAuthStateChanged(auth, (user) => {
    userState.value = user ? 'SignedIn' : 'SignedOut'
  })

  async function SignInWithCredential(credential, next) {
    try {
      await setPersistence(this.auth, browserSessionPersistence)
      const res = await signInWithCredential(this.auth, credential)
      if (res.user.uid !== process.env.MRGREEN_UID) {
        Notify.create({
          type: 'negative',
          message: '權限不足',
          position: 'top',
        })
        this.router.replace({ name: 'SignIn' })
      } else {
        sessionStorage.setItem('token', res.user.accessToken)
        next()
      }
    } catch (error) {
      console.log(error)
      Notify.create({
        type: 'negative',
        message: JSON.stringify(error.data),
        position: 'top',
      })
      this.router.replace({ name: 'SignIn' })
    }
  }

  function checkUserState() {
    return new Promise((resolve) => {
      switch (userState.value) {
        case 'Unknown': {
          const unwatch = watch(userState, () => {
            unwatch()
            resolve(verifyUser())
          })
          break
        }
        case 'SignedIn':
          resolve(true)
          break
        case 'SignedOut':
          resolve(false)
          break
      }
    })
  }

  async function verifyUser() {
    const result = await checkUserState()

    if (!result || auth.currentUser.uid !== process.env.MRGREEN_UID) return false

    return true
  }

  return { app, auth, userState, signInWithCredential: SignInWithCredential, verifyUser }
})

