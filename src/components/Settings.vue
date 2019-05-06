<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">Settings</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-card>
      <form @submit.prevent="saveSettings">
        <div>
          <b-btn type="submit" variant="success">Save Settings</b-btn>
        </div>
      </form>
    </b-card>
  </div>
</template>

<script>
import api from '@/api'
export default {
  data () {
    return {
      loading: false,
      user: [],
    }
  },
  async created () {
    this.refreshUser()
  },
  methods: {
    async refreshUser () {
      this.loading = true
      this.user = await api.getUser()
      this.loading = false
    },
    async saveSettings () {
      await api.updateSettings(this.user._id, this.user)
      await this.refreshUser()
    }
  }
}
</script>
