<!-- src/views/Profile.vue -->

<template>
  <div v-if="profile">
    <div>
      <div>
        <img :src="profile.picture">
      </div>
      <div>
        <h2>{{ profile.name }}</h2>
        <p>{{ profile.email }}</p>
      </div>
    </div>

    <div>
      <pre>{{ JSON.stringify(profile, null, 2) }}</pre>
    </div>
    <vue-headful
      description="My ultraPacer profile."
      title="Privacy - ultraPacer"
    />
  </div>
</template>

<script>
export default {
  title: 'My Profile',
  data () {
    return {
      profile: this.$auth.profile
    }
  },
  methods: {
    handleLoginEvent (data) {
      this.profile = data.profile
    }
  }
}
</script>
