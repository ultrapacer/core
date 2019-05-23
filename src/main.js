// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import AuthPlugin from './plugins/auth'
import VuePageTitle from 'vue-page-title'
import VueTheMask from 'vue-the-mask'

import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

import 'vue-awesome/icons/trash'
import 'vue-awesome/icons/edit'
import 'vue-awesome/icons/plus'
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
Vue.use(VuePageTitle, {
  // prefix: 'My App - ',
  suffix: '- ultraPacer'
})

Vue.use(VueTheMask)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
