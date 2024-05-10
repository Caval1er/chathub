import { createApp } from 'vue'
import { setupStore } from '@/store/index'
import { setupRouterGuard } from './router/guard'
import router, { setupRouter } from './router'
import { setupVuetify } from './plugins/vuetify'
import { setVueRequstGlobal } from './plugins/vueRequest'
import directives from './directives'
import App from './App.vue'
const app = createApp(App)
setupStore(app)
setVueRequstGlobal()
setupRouter(app)
setupRouterGuard(router)
setupVuetify(app)
app.use(directives)
app.mount('#app')
