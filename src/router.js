import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Callback from '@/components/Callback'
import Profile from '@/components/Profile'
import auth from './auth/authService'
import CoursesManager from '@/components/CoursesManager'
import Course from '@/components/Course'
import Settings from '@/components/Settings'

Vue.use(Router)

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    },
    {
      path: '/courses',
      name: 'CoursesManager',
      component: CoursesManager
    },
    {
      path: '/course/:course',
      name: 'course',
      component: Course
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path === '/' || to.path === '/callback' || auth.isAuthenticated()) {
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
