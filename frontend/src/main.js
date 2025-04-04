import { createApp } from 'vue'
import App from './App.vue'
import { ComponentLibrary } from '@infineon/infineon-design-system-vue';
import './assets/base.scss'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

app.use(ComponentLibrary)
app.use(router)
app.use(pinia)
app.mount('#app')