<template>
  <div
    class="container-fluid mt-4"
    style="max-width:50rem"
  >
    <h1 class="h1 d-none d-md-block">
      Email Preferences
    </h1>
    <b-card v-if="!$status.loading">
      <h4>Address: {{ email }}</h4>
      <email-preferences-input
        v-model="unsubcriptions"
        @input="status='changed'"
      />

      <div

        class="mt-3"
      >
        <b-button
          v-if="status==='changed'"
          type="submit"
          variant="success"
          @click="save"
        >
          Save Changes
        </b-button>

        <p v-else-if="status==='success'">
          <b>Preferences updated.</b>
        </p>
      </div>
    </b-card>
    <vue-headful
      description="ultraPacer email preferences"
      title="Email Preferences - ultraPacer"
    />
  </div>
</template>

<script>
import EmailPreferencesInput from '../forms/EmailPreferencesInput'
export default {
  title: 'Email Preferences',
  components: {
    EmailPreferencesInput
  },
  data () {
    return {
      status: 'none',
      email: '',
      logger: this.$log.child({ file: 'EmailPreferences.vue' }),
      token: '',
      unsubcriptions: {
        all: false,
        categories: []
      }
    }
  },
  async created () {
    this.$status.loading = true
    this.populate()
  },
  methods: {
    async save () {
      const log = this.logger.child({ method: 'save' })
      try {
        this.$status.processing = true
        await this.$api.updateUserUnsubscriptions(this.email, this.token, this.unsubcriptions)
        this.status = 'success'
      } catch (error) {
        log.error(error.stack || error, { error: error })
      }
      this.$status.processing = false
    },
    async populate () {
      const log = this.logger.child({ method: 'populate' })
      try {
        this.$status.loading = true
        if (this.$route.query.email && this.$route.query.token) {
          this.email = this.$route.query.email
          this.token = this.$route.query.token
          const unsubcriptions = await this.$api.getUserUnsubscriptions(this.email, this.token)
          Object.assign(this.unsubcriptions, unsubcriptions)
          log.verbose('Subscriptions retrieved.')
        } else {
          return this.$router.push({ path: '/' })
        }
        this.$status.loading = false
      } catch (error) {
        log.error(error.stack || error, { error: error, silent: true })
        this.$router.push({ path: '/' })
      }
    }
  }
}
</script>
