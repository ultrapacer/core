// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import AuthPlugin from './plugins/auth'
import LoggerPlugin from './plugins/logger'
import VueAnalytics from 'vue-analytics'
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
  height: 100
})
Vue.use(AuthPlugin)

if (process.env.GOOGLE_ANALYTICS_KEY) {
  const isBeta = window.location.origin.includes('appspot.com')
  Vue.use(VueAnalytics, {
    id: process.env.GOOGLE_ANALYTICS_KEY,
    router,
    ignoreRoutes: ['/callback'],
    debug: {
      sendHitTask: (process.env.NODE_ENV !== 'development' && !isBeta)
    },
    set: [
      { field: 'dimension1', value: false }
    ]
  })
}

Vue.use(VuePageTitle, {
  // prefix: 'My App - ',
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
Vue.prototype.$units = {
  dist: 'mi',
  alt: 'ft',
  distScale: 0.621371,
  altScale: 3.28084,
  set (dist, alt) {
    this.setDist(dist)
    this.setAlt(alt)
  },
  setDist (unit) {
    this.dist = unit
    this.distScale = (unit === 'mi') ? 0.621371 : 1
  },
  setAlt (unit) {
    this.alt = unit
    this.altScale = (unit === 'ft') ? 3.28084 : 1
  },
  distf (val, round = null) {
    const v = val * this.distScale
    return (round === null) ? v : v.toFixed(round)
  },
  altf (val, round = null) {
    const v = val * this.altScale
    return (round === null) ? v : v.toFixed(round)
  },
  pacef (val, round = null) {
    const v = val / this.distScale
    return (round === null) ? v : v.toFixed(round)
  }
}
Vue.prototype.$config = Vue.observable({
  requireGPXElevation: true
})
Vue.use(LoggerPlugin)

Vue.config.productionTip = false

/* eslint-disable no-new */
window.ultraPacer = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
