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

import 'vue-awesome/icons/brands/github'
import 'vue-awesome/icons/brands/instagram'
import 'vue-awesome/icons/brands/facebook'
import 'vue-awesome/icons/brands/patreon'
import 'vue-awesome/icons/brands/paypal'
import 'vue-awesome/icons/brands/strava'
import 'vue-awesome/icons/arrow-right'
import 'vue-awesome/icons/caret-square-down'
import 'vue-awesome/icons/download'
import 'vue-awesome/icons/edit'
import 'vue-awesome/icons/envelope'
import 'vue-awesome/icons/lock'
import 'vue-awesome/icons/plus'
import 'vue-awesome/icons/running'
import 'vue-awesome/icons/trash'
import VIcon from 'vue-awesome/components/Icon'

Vue.component('VIcon', VIcon)
Vue.component('VueHeadful', vueHeadful)

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
Vue.prototype.$user = Vue.observable({
  _id: null,
  isAuthenticated: false,
  admin: false
})
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
  calculating: false
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
Vue.use(LoggerPlugin)

Vue.config.productionTip = false

/* eslint-disable no-new */
window.ultraPacer = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
