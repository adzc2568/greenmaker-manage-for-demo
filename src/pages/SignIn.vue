<template>
  <q-page class="flex flex-center">
    <div id="google-login-btn"></div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'

const apiHost = process.env.API_HOST

onMounted(() => {
  google.accounts.id.initialize({
    client_id: '499829147697-ak5erh7firslai60vjqf3bu00muad3nu.apps.googleusercontent.com',
    context: 'signin',
    ux_mode: 'redirect',
    login_uri: `${apiHost}/api/auth/login`,
    auto_select: true,
    itp_support: true,
  })
  google.accounts.id.renderButton(document.getElementById('google-login-btn'), {
    theme: 'outline',
    size: 'large',
    type: 'standard',
    shape: 'rectangular',
    text: 'signin_with',
    locale: 'zh-TW',
    logo_alignment: 'left',
  })
  google.accounts.id.prompt()
})
</script>

