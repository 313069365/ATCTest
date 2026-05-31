import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import SvgIcon from '@/components/common/SvgIcon.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.component('SvgIcon', SvgIcon)

app.mount('#app')
