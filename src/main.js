// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import AuthPlugin from './plugins/auth'
import LoggerPlugin from './plugins/logger'
import UnitsPlugin from './plugins/units'
import VueGtag from 'vue-gtag'
import VuePageTitle from 'vue-page-title'
import VueTheMask from 'vue-the-mask'
import vueHeadful from 'vue-headful'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import 'vue-awesome/icons/brands/github'
import 'vue-awesome/icons/brands/instagram'
import 'vue-awesome/icons/brands/facebook'
import 'vue-awesome/icons/brands/patreon'
import 'vue-awesome/icons/brands/paypal'
import 'vue-awesome/icons/brands/strava'
import 'vue-awesome/icons/brands/youtube'
import 'vue-awesome/icons/arrow-right'
import 'vue-awesome/icons/caret-square-down'
import 'vue-awesome/icons/download'
import 'vue-awesome/icons/edit'
import 'vue-awesome/icons/envelope'
import 'vue-awesome/icons/lock'
import 'vue-awesome/icons/plus'
import 'vue-awesome/icons/print'
import 'vue-awesome/icons/running'
import 'vue-awesome/icons/share-alt'
import 'vue-awesome/icons/trash'
import VIcon from 'vue-awesome/components/Icon'
import './custom.scss'

// eslint-disable-next-line no-unused-vars
import geo from '@/util/geo'

Vue.component('VIcon', VIcon)
Vue.component('VueHeadful', vueHeadful)
Vue.use(Loading, {
  color: '#5e8351',
  loader: 'spinner',
  width: 100,
  height: 100,
  zIndex: 1055
})
Vue.use(AuthPlugin)

const testing = window.location.origin.includes('appspot.com') ||
  window.location.origin.includes('localhost')
Vue.use(VueGtag, {
  enabled: !testing,
  config: { id: process.env.GOOGLE_ANALYTICS_KEY },
  onReady () { this.set({ dimension1: false }) },
  pageTrackerExcludedRotues: ['/callback']
}, router)

Vue.use(VuePageTitle, {
  suffix: '- ultraPacer'
})
Vue.use(VueTheMask)
Vue.prototype.$user = Vue.observable({
  _id: null,
  isAuthenticated: false,
  admin: false
})
Vue.prototype.$colors = {
  blue1: '#033E75', // dark blue
  blue2: '#2B6499', // medium blue
  green2: '#415837', // medium green
  brown2: '#422a22', // medium brown
  red2: '#dc3545' // med red
}
Vue.prototype.$waypointTypes = {
  start: 'Start',
  finish: 'Finish',
  aid: 'Aid Station',
  water: 'Water Source',
  landmark: 'Landmark',
  junction: 'Junction',
  other: 'Other'
}
Vue.prototype.$status = Vue.observable({
  processing: false,
  loading: false
})
Vue.prototype.$window = Vue.observable({
  height: window.innerHeight,
  width: window.innerWidth
})

Vue.prototype.$utils = {
  timeout: (prom, time) => Promise.race([prom, new Promise((resolve, reject) => setTimeout(reject, time))])
}
// this is a temp fix to reformat the old vue-analytics format to vue-gtag:
Vue.prototype.$gtage = (gtag, category, action, label, value) => {
  const o = { event_category: category }
  if (label) o.event_label = label
  if (value) o.value = value
  gtag.event(action, o)
}
Vue.prototype.$config = Vue.observable({
  requireGPXElevation: true,
  testing: testing
})

//  -----  VUE FILTERS  -----  //
Vue.filter('commas', function (value) {
  if (!value) {
    return ''
  }
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
})

Vue.use(LoggerPlugin)
Vue.use(UnitsPlugin)

Vue.config.productionTip = false

/* eslint-disable no-new */
window.ultraPacer = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
