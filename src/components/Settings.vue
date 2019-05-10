<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">Settings</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-card>
      <form @submit.prevent="saveSettings">
        <b-form-group label="Distance Units">
          <b-form-select v-model="user.distUnits" :options="distUnits"></b-form-select>
        </b-form-group>
        <b-form-group label="Elevation Units">
          <b-form-select v-model="user.elevUnits" :options="elevUnits"></b-form-select>
        </b-form-group>
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
  title: 'My Settings',
  props: ['user'],
  data () {
    return {
      loading: false,
      distUnits: [
        {
          value: 'mi',
          text: 'Miles'
        },
        {
          value: 'km',
          text: 'Kilometers'
        }
      ],
      elevUnits: [
        {
          value: 'ft',
          text: 'Feet'
        },
        {
          value: 'm',
          text: 'Meters'
        }
      ]
    }
  },
  methods: {
    async saveSettings () {
      await api.updateSettings(this.user._id, this.user)
      await api.getUser()
      this.$emit('user', this.user)
      this.$router.go(-1)
    }
  }
}
</script>
