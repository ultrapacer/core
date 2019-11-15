import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Callback from '@/components/Callback'
import Profile from '@/components/Profile'
import auth from './auth/authService'
import CoursesManager from '@/components/CoursesManager'
import Course from '@/components/Course'
import Settings from '@/components/Settings'
import PrivacyPolicy from '@/components/PrivacyPolicy'
import About from '@/components/About'
import Help from '@/components/Help'

Vue.use(Router)

let router = new Router({
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
      component: Profile,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/courses',
      name: 'CoursesManager',
      component: CoursesManager,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/course/:course',
      name: 'Course',
      component: Course
    },
    {
      path: '/race/:permalink',
      name: 'Race',
      component: Course
    },
    {
      path: '/course/plan/:plan',
      name: 'Plan',
      component: Course
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '/help',
      name: 'Help',
      component: Help
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (!to.meta.requiresAuth || auth.isAuthenticated()) {
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
