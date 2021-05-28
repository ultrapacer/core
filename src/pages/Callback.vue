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
  created () {
    this.$auth.handleAuthentication()
  },
  methods: {
    handleLoginEvent (data) {
      if (data.state.route) {
        this.$router.push(data.state.route)
      } else if (data.state.query) {
        this.$router.push({ path: data.state.target, query: data.state.query })
      } else {
        this.$router.push(data.state.target || '/')
      }
    }
  }
}
</script>
