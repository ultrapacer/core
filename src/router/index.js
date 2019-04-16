import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import PostsManager from '@/components/PostsManager'
import Callback from '@/components/Callback'
import Profile from '@/components/Profile'
import auth from "../auth/authService";

/* Vue.use(Auth, {
  issuer: 'https://dev-375773.okta.com/oauth2/default',
  client_id: '{clientId}',
  redirect_uri: 'http://localhost:8080/implicit/callback',
  scope: 'openid profile email'
}) */

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
      path: '/posts-manager',
      name: 'PostsManager',
      component: PostsManager,
      meta: {
        //requiresAuth: true
      }
    },
    {
      path: "/profile",
      name: "Profile",
      component: Profile
    }       
  ]
})

// NEW - add a `beforeEach` handler to each route
router.beforeEach((to, from, next) => {
  if (to.path === "/" || to.path === "/callback" || auth.isAuthenticated()) {
    return next();
  }

  // Specify the current path as the customState parameter, meaning it
  // will be returned to the application after auth
  auth.login({ target: to.path });
});


export default router