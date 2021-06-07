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
    <patreon-modal
      v-if="$user.isAuthenticated"
      ref="patreonModal"
    />
  </div>
</template>

<script>
import api from '@/api'
import MenuSocial from './components/MenuSocial'
import Sponsor from './components/Sponsor'
export default {
  name: 'App',
  components: {
    MenuSocial,
    Sponsor,
    PatreonModal: () => import(/* webpackPrefetch: true */ './components/PatreonModal.vue')
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
      // make login return to current page
      const r = this.$router.currentRoute
      this.$auth.login({
        route: {
          name: r.name,
          params: r.params,
          query: r.query
        }
      })
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
.primary-page {
  max-width: 50rem;
  margin-top: 1.5rem;
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}
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
  @media (min-width: 768px) {
    margin-left: -12px;
  }
  @media (max-width: 767px) {
    float:right;
    margin-right: -8px;
  }
  @media (max-width: 767px) {
    height: 64px;
    width: 64px;
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
  .btn {
    padding: 0.05rem 0.3rem;
  }
}
.table-sm td .form-control {
  height: auto;
  padding: 0.05rem 0.3rem;
}
.segment-table .b-table-details td {
  padding-top: 0 !important;
  padding-bottom: 0 !important
}
.modal-dialog {
  padding-top: 56px;
}
.form-tip {
  color: #5e8351;
  margin-bottom: 0.5rem;
}
.documentation img  {
  max-width: 100%;
  max-height: 300px;
  object-fit:scale-down;
}
.table-xs td, .table-xs th {
  font-size: 90%;
  line-height: 1.25;
}
.collapse-button {
  font-size: 80% !important;
}
.coursetitlecolumn {
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
.show-all-cells {
  th, td {
    display: table-cell !important;
  }
}
th {
  white-space: nowrap;
}
.mw-7rem {
  max-width: 7rem;
}
</style>
