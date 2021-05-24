<template>
  <div id="app">
    <b-navbar
      toggleable="md"
      type="dark"
      variant="dark"
      style="z-index: 1060;"
      :sticky="$window.width >= 768"
    >
      <b-navbar-toggle
        target="nav_collapse"
        style="z-index: 80;"
      />
      <div
        class="d-block d-md-none navbar-dark navbar-brand navbar-title"
      >
        {{ $title }}
      </div>
      <b-navbar-brand :href="$user.isAuthenticated ? '/about' : '/'">
        <div>
          <div
            class="navbar-logo"
            style="float:left;"
          >
            <img
              src="./assets/logo-72x72.png"
              class="navbar-logo-img"
            >
          </div>
          <div class="d-none d-md-block navbar-ultrapacer">
            ultraPacer
          </div>
        </div>
      </b-navbar-brand>
      <b-collapse
        id="nav_collapse"
        is-nav
      >
        <b-navbar-nav>
          <b-nav-item
            v-if="$user.isAuthenticated"
            to="/courses"
          >
            My Courses
          </b-nav-item>
          <b-nav-item
            v-else
            to="/"
          >
            About
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
          <b-nav-item to="/docs">
            Docs
          </b-nav-item>
          <b-nav-item
            v-if="$user.isAuthenticated"
            to="/about"
            class="d-block d-md-none d-lg-block"
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
      <menu-social
        class="d-none d-md-block navbar-nav "
      />
    </b-navbar>
    <!-- routes will be rendered here -->

    <router-view
      ref="routerView"
    />
    <sponsor ref="sponsor" />
    <patreon-modal ref="patreonModal" />
  </div>
</template>

<script>
import api from '@/api'
import MenuSocial from './components/MenuSocial'
import Sponsor from './components/Sponsor'
import PatreonModal from './components/PatreonModal'
export default {
  name: 'App',
  components: {
    MenuSocial,
    Sponsor,
    PatreonModal
  },
  data () {
    return {
      user: {},
      authInterval: null,
      spinner: {}
    }
  },
  computed: {
    showSpinner () {
      return this.$status.loading || this.$status.processing
    }
  },
  watch: {
    '$user.isAuthenticated': function (val) {
      if (val) {
        this.getUser()
      } else {
        this.$router.push({ name: 'Home' })
      }
    },
    showSpinner: function (val) {
      if (val) {
        this.spinner = this.$loading.show({
          zIndex: 1055
        })
      } else {
        this.spinner.hide()
      }
    },
    '$status.processing': function (val) {
      if (val) {
        window.onbeforeunload = function () {
          return true
        }
      } else {
        window.onbeforeunload = null
      }
    }
  },
  async created () {
    try {
      await this.$auth.renewTokens()
    } catch (e) {
      console.log(e)
    }
    window.addEventListener('resize', () => {
      this.$window.width = window.innerWidth
      this.$window.height = window.innerHeight
    })
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
.navbar-logo {
  height:24px;
  width: 40px;
}
.navbar-logo-img {
  margin-top:-11px;
  position:absolute;
  @media (min-width: 576px) {
    margin-left: -12px;
  }
  @media (max-width: 575px) {
    float:right;
    margin-right: -5px;
  }
}
.navbar-title {
  margin-top: 8px;
  top: 0;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: absolute;
  margin-left: -1rem;
  padding-left: 80px;
  padding-right: 70px;
  width: 100%;
  z-index: 1;
}
.navbar-ultrapacer {
  font-size: 1.5rem;
  line-height: 1;
  margin-left: 50px;
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
.modal-dialog {
  padding-top: 56px;
}
.form-tip {
  margin-top: -0.4rem;
  color: #5e8351;
  font-size: 0.8rem;
}
.documentation img  {
  max-width: 100%;
  max-height: 300px;
  object-fit:scale-down;
}
.table-xs td, .table-xs th {
  font-size: 0.8rem;
  line-height: 1.1rem;
}
.coursetitlecolumn {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 150px;
  @media (min-width: 576px) {
    max-width: 200px;
  }
  @media (min-width: 768px) {
    max-width: 350px;
  }
  @media (min-width: 992px) {
    max-width: 400px
  }
}
</style>
