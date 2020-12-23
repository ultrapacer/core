<template>
  <div id="app">
    <b-navbar
      toggleable="md"
      type="dark"
      variant="dark"
    >
      <b-navbar-toggle target="nav_collapse" />
      <b-navbar-brand>
        <span class="d-none d-md-block">ultraPacer</span>
        <span
          v-if="!$status.calculating"
          class="d-block d-md-none"
        >{{ $title }} | uP</span>
      </b-navbar-brand>
      <b-collapse
        id="nav_collapse"
        is-nav
      >
        <b-navbar-nav>
          <b-nav-item to="/">
            {{ $user.isAuthenticated ? 'My Courses' : 'About' }}
          </b-nav-item>
          <b-nav-item to="/races">
            Races
          </b-nav-item>
          <b-nav-item
            v-if="$user.isAuthenticated"
            to="/settings"
          >
            Settings
          </b-nav-item>
          <b-nav-item to="/help">
            Help
          </b-nav-item>
          <b-nav-item
            v-if="$user.isAuthenticated"
            to="/about"
          >
            About
          </b-nav-item>
          <b-nav-item
            v-if="!$user.isAuthenticated"
            href="#"
            @click.prevent="login"
          >
            Login/Signup
          </b-nav-item>
          <b-nav-item
            v-else
            href="#"
            @click.prevent="logout"
          >
            Logout
          </b-nav-item>
          <menu-social class="d-block d-md-none " />
        </b-navbar-nav>
      </b-collapse>
      <span v-if="$status.calculating"><b-spinner
        variant="primary"
        label="Spinning"
      /></span>
      <menu-social
        v-else
        class="d-none d-md-block navbar-nav "
      />
    </b-navbar>
    <!-- routes will be rendered here -->
    <router-view
      ref="routerView"
    />
  </div>
</template>

<script>
import api from '@/api'
import MenuSocial from './components/MenuSocial'
export default {
  name: 'App',
  components: {
    MenuSocial
  },
  data () {
    return {
      user: {},
      authInterval: null
    }
  },
  watch: {
    '$user.isAuthenticated': function (val) {
      if (val) {
        this.getUser()
      } else {
        this.$router.push({ name: 'Home' })
      }
    }
  },
  async created () {
    try {
      await this.$auth.renewTokens()
    } catch (e) {
      console.log(e)
    }
  },
  methods: {
    login () {
      // this is kind of a hack for temp plans to go back to that
      // location after login:
      const r = this.$router.currentRoute
      if (
        (r.name === 'Course' || r.name === 'Race') &&
        Object.keys(r.query)[0] === 'plan'
      ) {
        const route = {
          name: 'Course',
          params: {
            course: r.params.course
          },
          query: {
            plan: r.query.plan
          }
        }
        if (r.params.permalink) {
          route.name = 'Race'
          route.params.permalink = r.params.permalink
        }
        this.$auth.login({
          route: route
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
      this.$user.isAuthenticated = data.loggedIn
      this.profile = data.profile
      this.$ga.event('User', 'authenticated')
      this.$ga.set({ dimension1: true })
      this.authInterval = window.setInterval(this.refreshAuth, 30000)
    },
    async getUser () {
      this.user = await api.getUser()
      this.$user._id = this.user._id
      this.$user.admin = this.user.admin
      this.$units.setDist(this.user.distUnits)
      this.$units.setAlt(this.user.elevUnits)
      if (!this.user.email) {
        api.updateSettings(this.user._id, { email: this.$auth.profile.email })
      }
      if (this.user.admin) {
        // ignore analytics metrics for admins
        this.$ga.disable()
      }
    },
    async refreshAuth () {
      this.$user.isAuthenticated = await this.$auth.isAuthenticated()
      this.$logger(`Authenticated: ${this.$user.isAuthenticated}`)
      if (!this.$user.isAuthenticated) {
        window.clearInterval(this.refreshAuth)
      }
    }
  }
}
</script>

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
