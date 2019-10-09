// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import AuthPlugin from './plugins/auth'
import LoggerPlugin from './plugins/logger'
import VueAnalytics from 'vue-analytics'
import VuePageTitle from 'vue-page-title'
import VueTheMask from 'vue-the-mask'

import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

import 'vue-awesome/icons/download'
import 'vue-awesome/icons/edit'
import 'vue-awesome/icons/facebook'
import 'vue-awesome/icons/lock'
import 'vue-awesome/icons/plus'
import 'vue-awesome/icons/strava'
import 'vue-awesome/icons/trash'
import VIcon from 'vue-awesome/components/Icon'
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})
Vue.component('v-icon', VIcon)

Vue.use(BootstrapVue)
Vue.use(AuthPlugin)
Vue.use(VueAnalytics, {
  id: 'UA-148791352-1',
  router,
  ignoreRoutes: ['/callback'],
  debug: {
    sendHitTask: process.env.NODE_ENV !== 'development'
  },
  set: [
    { field: 'dimension1', value: false }
  ]
})
Vue.use(VuePageTitle, {
  // prefix: 'My App - ',
  suffix: '- ultraPacer'
})
Vue.use(VueTheMask)
Vue.prototype.$waypointTypes = {
  start: 'Start',
  finish: 'Finish',
  aid: 'Aid Station',
  water: 'Water Source',
  landmark: 'Landmark',
  junction: 'Junction',
  other: 'Other'
}
Vue.prototype.$calculating = {
  _vm: new Vue({data: {
    calculating: false
  }}),
  setCalculating (calculating) {
    this._vm.$data.calculating = calculating
  },
  isCalculating () {
    return this._vm.$data.calculating
  }
}
Vue.use(LoggerPlugin)

Vue.config.productionTip = false

/* eslint-disable no-new */
window.ultraPacer = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
