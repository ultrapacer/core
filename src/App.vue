<template>
  <div id="app">
    <b-navbar toggleable="md" type="dark" variant="dark">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand>
        <span class="d-none d-md-block">ultraPacer</span>
        <span v-if="!$calculating.isCalculating()" class="d-block d-md-none">{{ $title }} | uP</span>
      </b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav>
          <b-nav-item to="/">{{ isAuthenticated ? 'Courses' : 'About' }}</b-nav-item>
          <b-nav-item to="/settings" v-if="isAuthenticated">Settings</b-nav-item>
          <b-nav-item to="/help">Help</b-nav-item>
          <b-nav-item v-if="isAuthenticated" to="/about">About</b-nav-item>
          <b-nav-item href="#" @click.prevent="login" v-if="!isAuthenticated">Login/Signup</b-nav-item>
          <b-nav-item href="#" @click.prevent="logout" v-else>Logout</b-nav-item>
          <menu-social class="d-block d-md-none "></menu-social>
        </b-navbar-nav>
      </b-collapse>
      <span v-if="$calculating.isCalculating()"><b-spinner variant="primary" label="Spinning"></b-spinner></span>
      <menu-social v-else class="d-none d-md-block navbar-nav "></menu-social>
    </b-navbar>
    <!-- routes will be rendered here -->
    <router-view :isAuthenticated="isAuthenticated" :user="user" />
  </div>
</template>
<style>
.btn .fa-icon {
    vertical-align: middle;
    margin-top: -0.25rem;
}
.btn span:last-child {
    margin-left: 0.5rem;
}
.actionButtonColumn {
  white-space: nowrap;
  text-align: right !important;
  padding-top: 0.1rem !important;
  padding-bottom: 0.1rem !important;
  vertical-align: middle !important;
}
.table-sm td {
  font-size: 0.9rem;
  padding-left: 0.15rem;
  padding-right: 0.15rem;
  line-height: 1.25;
}
.table-sm th {
  font-size: 0.9rem;
  padding-left: 0.15rem;
  padding-right: 0.15rem;
}
.tinyButton {
  padding: 0.18rem !important;
  line-height: 1.2 !important;
  font-size: 0.7rem !important;
}
.segment-table .b-table-details td {
  padding-top: 0 !important;
  padding-bottom: 0 !important
}
</style>
<script>
import api from '@/api'
import MenuSocial from './components/MenuSocial'
export default {
  name: 'app',
  components: {
    MenuSocial
  },
  data () {
    return {
      isAuthenticated: false,
      user: {}
    }
  },
  async created () {
    try {
      await this.$auth.renewTokens()
    } catch (e) {
      console.log(e)
    }
  },
  watch: {
    isAuthenticated: function (val) {
      if (val) {
        this.updateUser()
      }
    }
  },
  methods: {
    login () {
      // this is kind of a hack for temp plans to go back to that
      // location after login:
      let r = this.$router.currentRoute
      if (
        r.name === 'Course' &&
        Object.keys(r.query)[0] === 'plan'
      ) {
        this.$auth.login({
          route: {
            name: 'Course',
            params: {
              'course': r.params.course
            },
            query: {
              plan: r.query.plan
            }
          }
        })
      } else {
        this.$auth.login()
      }
      this.$ga.event('User', 'login')
    },
    logout () {
      this.$auth.logOut()
      this.$ga.event('User', 'logout')
    },
    handleLoginEvent (data) {
      this.isAuthenticated = data.loggedIn
      this.profile = data.profile
      this.$ga.event('User', 'authenticated')
      this.$ga.set({ 'dimension1': true })
    },
    async updateUser () {
      this.user = await api.getUser()
      if (!this.user.email) {
        api.updateSettings(this.user._id, {email: this.$auth.profile.email})
      }
      if (this.user.admin) {
        // ignore analytics metrics for admins
        this.$ga.disable()
      }
    }
  }
}
</script>
