import { createApp } from 'vue';
import { ComponentLibrary } from '@infineon/infineon-design-system-vue';
import App from './App.vue';

const app = createApp(App);
app.use(ComponentLibrary);
app.mount('#app'); 