import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Callback from '@/components/Callback'
import auth from './auth/authService'
import PrivacyPolicy from '@/components/PrivacyPolicy'
import api from '@/api'

Vue.use(Router)

function lazyLoad (view) {
  return () => import(/* webpackPrefetch: true */ `@/components/${view}.vue`)
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
  const isAuthenticated = auth.isAuthenticated()

  // if navigating to a course, check if public and login otherwise:
  if (!isAuthenticated && (to.name === 'Course' || to.name === 'Plan')) {
    try {
      const id = to.name === 'Course' ? to.params.course : to.params.plan
      const ispublic = await api.isPublic(to.name.toLowerCase(), id)
      to.meta.requiresAuth = !ispublic
    } catch (err) {
      console.log(err)
    }
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
})

export default router
