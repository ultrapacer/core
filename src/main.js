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
import 'vue-awesome/icons/mug-hot'
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

// eslint-disable-next-line no-undef
Vue.prototype.$secrets = SECRETS // from webpack config

VIcon.register({
  venmo: {
    width: 162,
    height: 162,
    d: 'M136.8,14.9c4.8,8,7,16.2,7,26.6c0,33.2-28.3,76.2-51.3,106.5H40L19,22.1l46-4.4l11.1,89.6c10.4-16.9,23.2-43.6,23.2-61.7c0-9.9-1.7-16.7-4.4-22.3L136.8,14.9z'
  }
})

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
  config: { id: Vue.prototype.$secrets.GOOGLE_ANALYTICS_KEY },
  onReady () { this.set({ dimension1: false }) },
  pageTrackerExcludedRotues: ['/callback']
}, router)

Vue.use(VuePageTitle, {
  suffix: '- ultraPacer'
})
Vue.use(VueTheMask)
Vue.prototype.$user = Vue.observable({
  _id: null,
  isAuthenticated: false, // authenticated
  isValid: false, // both authenticated AND has id
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
  width: window.innerWidth,
  isSmall: function () { return this.width < 768 }
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

  // typical logging in production:
  logLevel: 'warn',

  // typical limit for courses/user
  freeCourses: 6,
  freeCoursesLimit: 50, // allow url query line config up to this

  // typical limit for points/course
  maxGPXPoints: 100000,
  maxGPXPointsLimit: 1000000, // allow url query line config up to this

  // routine to update config items from query object:
  update (query) {
    const fields = ['logLevel', 'freeCourses', 'maxGPXPoints']
    if (fields.findIndex(f => Object.keys(query).includes(f)) >= 0) {
      if (query.logLevel) this.logLevel = query.logLevel
      if (query.freeCourses) this.freeCourses = Math.min(parseInt(query.freeCourses) || this.freeCourses, this.freeCoursesLimit)
      if (query.maxGPXPoints) this.maxGPXPoints = Math.min(parseInt(query.maxGPXPoints) || this.maxGPXPoints, this.maxGPXPointsLimit)
      Vue.prototype.$log.child({ file: 'main.js', method: '$config.update' }).info(`${fields.filter(f => Object.keys(query).includes(f)).map(k => `${k}=${this[k]}`).join(', ')}`)
    }
  }
})

// add custom logger transport for analytics erros
const Transport = require('winston-transport')
class FrontendErrorTransport extends Transport {
  log (info, callback) {
    setImmediate(() => {
      this.emit('logged', info)
    })

    // format log string:
    const messageString = info.stack
      ? info.stack.split('\n')[0]
      : typeof (info.message) === 'string'
        ? info.message
        : (info.message.toString === Object.prototype.toString)
            ? JSON.stringify(info.message)
            : info.message.toString()
    const logStr = `${info.file ? '[' + info.file + ']' : ''}${info.method ? '[' + info.method + ']' : ''} ${messageString}`

    // report error to backend via api:
    Vue.prototype.$api.reportError({ error: logStr })

    // report to analytics:
    Vue.prototype.$gtag.exception({ description: logStr })

    // alert user if silent option is not passed:
    if (!info.silent) {
      Vue.prototype.$alert.show(
        'Error performing action. Please report errors to help development.',
        { variant: 'danger' }
      )
    }

    callback()
  }
}
logger.add(new FrontendErrorTransport({ level: 'error' }))

Vue.prototype.$alert = Vue.observable({
  show: function (message, options = {}) {
    this.message = message
    this.variant = options.variant || 'primary'
    this.click = options.click ? () => { options.click(); this.timer = 0 } : () => {}
    this.class = options.click ? 'alert-link' : ''
    this.timer = options.timer || 5
    this.persistOnPageChange = options.persistOnPageChange || false
  },
  message: '',
  timer: 0,
  variant: '',
  click: () => {},
  class: '',
  persistOnPageChange: false
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
Vue.prototype.$log = logger
Vue.use(UnitsPlugin)

Vue.prototype.$helpers = require('./util/helpers')

Vue.config.productionTip = false

/* eslint-disable no-new */
window.ultraPacer = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
