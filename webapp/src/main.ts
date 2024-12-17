import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createHead } from '@unhead/vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
  }
})

const app = createApp(App)
app.use(createHead())
app.use(router)
app.use(vuetify)

app.mount('#app')
