import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import { createAuth0 } from '@auth0/auth0-vue';

const auth0 = createAuth0({
  domain: "deflock.us.auth0.com",
  clientId: "IEBa7ckgWrMGErTWXA8Z9q91hre7uII2",
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: "https://deflock.me/api",
  },
  cacheLocation: 'localstorage',
})


const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
  }
})

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.use(auth0)

app.mount('#app')
