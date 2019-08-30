<template>
  <div id="app">
    <b-navbar toggleable="md" type="dark" variant="dark">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand>
        <span class="d-none d-md-block">ultraPacer</span>
        <span class="d-block d-md-none">{{ $title }} | uP</span>
      </b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav>
          <b-nav-item to="/">Home</b-nav-item>
          <b-nav-item to="/courses" v-if="isAuthenticated">Courses</b-nav-item>
          <b-nav-item to="/settings" v-if="isAuthenticated">Settings</b-nav-item>
          <b-nav-item href="#" @click.prevent="login" v-if="!isAuthenticated">Login</b-nav-item>
          <b-nav-item href="#" @click.prevent="logout" v-else>Logout</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <!-- routes will be rendered here -->
    <router-view :isAuthenticated="isAuthenticated" :user="user" ref="test" />
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
</style>
<script>
import api from '@/api'
export default {
  name: 'app',
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
      this.$auth.login()
    },
    logout () {
      this.$auth.logOut()
    },
    handleLoginEvent (data) {
      this.isAuthenticated = data.loggedIn
      this.profile = data.profile
    },
    async updateUser () {
      this.user = await api.getUser()
    }
  }
}
</script>
