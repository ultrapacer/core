<!-- src/components/Callback.vue -->

<template>
  <div
    class="d-flex justify-content-center mb-3"
  >
    <b-spinner label="Loading..." />
  </div>
</template>

<script>
export default {
  data () {
    return {
      logger: this.$log.child({ file: 'Callback.vue' })
    }
  },
  created () {
    this.$auth.handleAuthentication()
  },
  methods: {
    async handleLoginEvent (data) {
      const log = this.logger.child({ method: 'handleLoginEvent' })
      log.verbose(JSON.stringify(data.state))
      if (data.state.route) {
        this.$router.push(data.state.route)
      } else if (data.state.query) {
        this.$router.push({ path: data.state.target, query: data.state.query })
      } else if (data.state.target) {
        this.$router.push({ target: data.state.target })
      } else {
        log.error(new Error('Invalid data.state'), { silent: true })
      }
    }
  }
}
</script>
