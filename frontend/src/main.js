import { createApp } from 'vue'
import App from './App.vue'
import { ComponentLibrary } from '@infineon/infineon-design-system-vue';
import './assets/base.scss'

const app = createApp(App)
app.use(ComponentLibrary)
app.mount('#app')