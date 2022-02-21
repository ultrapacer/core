// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import AuthPlugin from './plugins/auth'
import api from './api'
import logger from './log'
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
import 'vue-awesome/icons/chart-line'
import 'vue-awesome/icons/clock'
import 'vue-awesome/icons/download'
import 'vue-awesome/icons/edit'
import 'vue-awesome/icons/envelope'
import 'vue-awesome/icons/lock'
import 'vue-awesome/icons/minus-circle'
import 'vue-awesome/icons/plus'
import 'vue-awesome/icons/print'
import 'vue-awesome/icons/running'
import 'vue-awesome/icons/save'
import 'vue-awesome/icons/share-alt'
import 'vue-awesome/icons/times-circle'
import 'vue-awesome/icons/trash'
import VIcon from 'vue-awesome/components/Icon'
import './custom.scss'
import time from './util/time'
import core from '../core'
import math from '../core/math'
Vue.prototype.$core = core
Vue.prototype.$math = math

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
  admin: false,
  email: '',
  membership: {
    active: false
  }
})

// Color class helps for converting hex to rgb and rgba
class Color {
  constructor (hex) {
    this.hex = hex
  }

  get rgb () {
    const a = this.rgbArray
    return 'rgb(' + a[0] + ',' + a[1] + ',' + a[2] + ')'
  }

  transparentize (opacity = 0.5) {
    const a = this.rgbArray
    return 'rgb(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + opacity + ')'
  }

  get rgbArray () {
    let r = 0; let g = 0; let b = 0
    r = '0x' + this.hex[1] + this.hex[2]
    g = '0x' + this.hex[3] + this.hex[4]
    b = '0x' + this.hex[5] + this.hex[6]
    return [+r, +g, +b]
  }
}
const colors = {
  blue1: new Color('#033E75'), // dark blue
  blue2: new Color('#2B6499'), // medium blue
  green2: new Color('#415837'), // medium green
  brown2: new Color('#422a22'), // medium brown
  red2: new Color('#dc3545'), // med red
  white: new Color('#FFFFFF'),
  black: new Color('#000000')
}

// WaypointType class helps with getting colors for profile & map
class WaypointType {
  constructor (obj) {
    Object.keys(obj).forEach(k => {
      this[k] = obj[k]
    })
  }

  get backgroundColor () {
    return this.bgColor || this.color
  }
}
Vue.prototype.$colors = colors
Vue.prototype.$waypointTypes = {
  start: new WaypointType({ text: 'Start', color: colors.black, short: 'S' }),
  finish: new WaypointType({ text: 'Finish', color: colors.black, short: 'F' }),
  aid: new WaypointType({ text: 'Aid Station', color: colors.red2, short: 'AS' }),
  water: new WaypointType({ text: 'Water Source', color: colors.blue1, short: 'W' }),
  landmark: new WaypointType({ text: 'Landmark', color: colors.green2, short: 'L' }),
  junction: new WaypointType({ text: 'Junction', color: colors.black, bgColor: colors.white, short: 'J' }),
  other: new WaypointType({ text: 'Other', color: colors.black, short: 'O' })
}
Vue.prototype.$status = Vue.observable({
  processing: false,
  loading: false
})
Vue.prototype.$window = Vue.observable({
  height: window.innerHeight,
  width: window.innerWidth
})
Vue.prototype.$course = Vue.observable({
  view: 'plan',
  mode: 'view',
  owner: false,
  comparing: false
})

Vue.prototype.$utils = {
  timeout: async function (prom, time) {
    try {
      return await Promise.race([prom, new Promise((resolve, reject) => setTimeout(reject, time))])
    } catch (error) {
      throw new Error(`Timeout in ${time} ms`)
    }
  },
  time: time
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
  testing: testing,
  freeCoursesLimit: 5
})

Vue.prototype.$error = Vue.observable({
  handle: function (error, location, fatal = false) {
    try {
      logger.error(error.stack || error)

      // show alert:
      const description = (location ? `${location} => ` : '') + error.toString()
      const msg = `Error performing action${location ? ' [' + location + ']' : ''}. Please report errors to help development.`
      Vue.prototype.$alert.show(
        msg,
        { variant: 'danger' }
      )

      // report in analytics:
      Vue.prototype.$gtag.exception({
        description: description,
        fatal: fatal
      })

      // report to server
      const stack = (location ? `${location} => ` : '') + error.stack
      Vue.prototype.$api.reportError({ error: stack })
    } catch (err) {
      logger.error(err)
    }
  }
})

Vue.prototype.$alert = Vue.observable({
  show: function (message, options = {}) {
    this.message = message
    this.variant = options.variant || 'primary'
    this.timer = options.timer || 5
  },
  message: '',
  timer: 0,
  variant: ''
})

//  -----  VUE FILTERS  -----  //
Vue.filter('commas', function (value) {
  if (!value) {
    return ''
  }
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
})
Vue.filter('timef', function (value, format) {
  if (isNaN(value)) {
    return ''
  }
  return time.sec2string(value, format)
})

Vue.prototype.$api = api
Vue.prototype.$logger = logger.info // depreciated 10.29.2021
Vue.prototype.$log = logger
Vue.use(UnitsPlugin)

Vue.config.productionTip = false

/* eslint-disable no-new */
window.ultraPacer = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
