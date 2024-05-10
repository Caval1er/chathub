import highlight from './highlight'

export default {
  install(app) {
    app.directive('highlight', highlight)
  },
}
