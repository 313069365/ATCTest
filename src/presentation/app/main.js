import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/presentation/router'
import App from '@/presentation/app/App.vue'
import '@/presentation/app/style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
