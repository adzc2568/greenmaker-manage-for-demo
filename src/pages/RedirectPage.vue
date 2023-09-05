<template>
  <q-page class="flex flex-center">
    <q-circular-progress indeterminate rounded size="lg" color="lime"></q-circular-progress>
  </q-page>
</template>
<script setup>
import { GoogleAuthProvider } from 'firebase/auth'
import { useRoute, useRouter } from 'vue-router'
import { useFirebaseStore } from 'src/stores/firebase'

const fsStore = useFirebaseStore()
const route = useRoute()
const router = useRouter()

const init = async () => {
  const idToken = route.query.credential
  const credential = GoogleAuthProvider.credential(idToken)

  fsStore.signInWithCredential(credential, () => router.replace({ name: 'Article' }))
}
init()
</script>

