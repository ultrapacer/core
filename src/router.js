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
      path: '*',
      redirect: '/'
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const log = logger.child({ method: 'beforeEach' })
  try {
    const isAuthenticated = auth.isAuthenticated()

    // if navigating to a course, check if public and login otherwise:
    if (to.name === 'Course' && !isAuthenticated) {
      const ispublic = await api.getCourseField(to.params.course, 'public', false)
      to.meta.requiresAuth = !ispublic
      logger.verbose(`Course ${to.params.course} is ${ispublic ? '' : 'not '} public.`)
    }
    if (isAuthenticated && to.name === 'Home') {
      next({ name: 'CoursesManager' })
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
    log.error(error.stack || error, { error: error })
  }
})

export default router
