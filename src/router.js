import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import Callback from '@/pages/Callback'
import auth from './auth/authService'
import PrivacyPolicy from '@/pages/PrivacyPolicy'
import api from '@/api'
const logger = require('winston').child({ file: 'router.js' })

// this avoids redundant navigation error if pushing/replacing a URL
const originalPush = Router.prototype.push
Router.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}
const originalReplace = Router.prototype.replace
Router.prototype.replace = function replace (location) {
  return originalReplace.call(this, location).catch(err => err)
}

Vue.use(Router)

function lazyLoad (view) {
  return () => import(/* webpackPrefetch: true */ `@/pages/${view}.vue`)
}

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/privacy',
      name: 'PrivacyPolicy',
      component: PrivacyPolicy
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback
    },
    {
      path: '/profile',
      name: 'Profile',
      component: lazyLoad('Profile'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: lazyLoad('Settings'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/races',
      name: 'Races',
      component: lazyLoad('Races')
    },
    {
      path: '/courses',
      name: 'CoursesManager',
      component: lazyLoad('CoursesManager'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/course/:course',
      name: 'Course',
      component: lazyLoad('Course')
    },
    {
      path: '/race/:permalink',
      name: 'Race',
      component: lazyLoad('Course')
    },
    {
      // this is an old path and is depreciated; use Race or Course with plan query
      path: '/course/plan/:plan',
      name: 'Plan',
      component: lazyLoad('Course')
    },
    {
      path: '/about',
      name: 'About',
      component: lazyLoad('About')
    },
    {
      path: '/docs',
      name: 'Docs',
      component: lazyLoad('Docs')
    },
    {
      path: '/docs/:doc',
      name: 'Doc',
      component: lazyLoad('Docs')
    },
    {
      path: '/emailpreferences',
      name: 'EmailPreferences',
      component: lazyLoad('EmailPreferences')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const log = logger.child({ method: 'beforeEach' })
  try {
    // bypass all of this if not changing actual path:
    if (to.path === from.path) return next()

    const isAuthenticated = await auth.isAuthenticated()

    // strip out any config items from query:
    if (to.query) Vue.prototype.$config.update(to.query)

    // if navigating to a course, check if public and login otherwise:
    if (to.name === 'Course' || to.name === 'Race') {
      log.verbose(`${isAuthenticated ? 'Authenticated' : 'Unauthenticated'}. Navigating to course ${to.params.course || to.params.permalink}.`)

      // see if they have permission to view course:
      let hasPermission = false
      try {
        Vue.prototype.$status.loading = true
        hasPermission = await api.getCoursePermission(to.params.course || to.params.permalink, 'view')
      } catch (error) {
        if (error.response?.status === 404) {
          Vue.prototype.$alert.show('Course not found.', { variant: 'danger', timer: 6, persistOnPageChange: true })
          log.warn('Course not found')
          return next({ name: 'Home' })
        } else {
          Vue.prototype.$alert.show('Error retrieving course.', { variant: 'danger', timer: 6, persistOnPageChange: true })
          log.warn('Error retrieving course')
          return next({ name: 'Home' })
        }
      }

      log.info(`hasPermission=${hasPermission}`)

      if (!hasPermission) {
        if (isAuthenticated) {
          log.warn('No permission to view course')
          Vue.prototype.$alert.show('No permission to view course.', { variant: 'danger', timer: 6, persistOnPageChange: true })
          return next({ name: 'CoursesManager' })
        } else {
          to.meta.requiresAuth = true
        }
      }
    }
    if (isAuthenticated && to.name === 'Home') {
      return next({ name: 'CoursesManager', query: to.query || null })
    }
    if (!to.meta.requiresAuth || isAuthenticated) {
      return next()
    }
    // Specify the current path as the customState parameter, meaning it
    // will be returned to the application after auth
    if (to.query == null) {
      auth.login({ target: to.path })
    } else {
      auth.login({ target: to.path, query: to.query })
    }
  } catch (error) {
    log.error(error)
  }
})

export default router
