<!-- src/components/Callback.vue -->

<template>
  <div>
    <p>Loading...</p>
  </div>
</template>

<script>
export default {
  methods: {
    handleLoginEvent (data) {
      if (data.state.query) {
        this.$router.push({path: data.state.target, query: data.state.query})
      } else {
        this.$router.push(data.state.target || '/')
      }
    }
  },
  created () {
    this.$auth.handleAuthentication()
  }
}
</script>
