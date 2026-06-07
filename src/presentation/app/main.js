import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/presentation/router'
import App from '@/presentation/app/App.vue'
import '@/presentation/app/style.css'
import SvgIcon from '@/presentation/components/common/SvgIcon.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.component('SvgIcon', SvgIcon)

app.mount('#app')
