import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
const vuetify = createVuetify()

export function setupVuetify(app) {
  app.use(vuetify)
}
export default vuetify
