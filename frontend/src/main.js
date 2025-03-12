import { createApp } from 'vue'
import App from './App.vue'
import { ComponentLibrary } from '@infineon/infineon-design-system-vue';
import './assets/base.scss'
import { createRouter, createWebHashHistory } from 'vue-router'

// Import view components
import ContactsView from './views/ContactsView.vue'
import ProductOverviewView from './views/ProductOverviewView.vue'
import FAQView from './views/FAQView.vue'
import InstructionsView from './views/InstructionsView.vue'

// Define routes
const routes = [
  { path: '/', redirect: '/contacts' },
  { path: '/contacts', component: ContactsView },
  { path: '/product-overview', component: ProductOverviewView },
  { path: '/faq', component: FAQView },
  { path: '/instructions', component: InstructionsView },
]

// Create router instance
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const app = createApp(App)
app.use(ComponentLibrary)
app.use(router)
app.mount('#app')