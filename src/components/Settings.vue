<template>
  <div class="container-fluid mt-4">
    <h1 class="h1 d-none d-md-block">Settings</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-card>
      <form @submit.prevent="saveSettings">
        <b-form-group label="Distance Units">
          <b-form-select v-model="user.distUnits" :options="distUnits">
          </b-form-select>
        </b-form-group>
        <b-form-group label="Elevation Units">
          <b-form-select v-model="user.elevUnits" :options="elevUnits">
          </b-form-select>
        </b-form-group>
        <b-form-group label="Custom Altitude Factor">
          <b-form-checkbox
              v-model="customAltModel"
              :unchecked-value="false"
            >
            Use Custom Altitude Factor
          </b-form-checkbox>
        </b-form-group>
        <b-card v-if="customAltModel">
          <b-form-group label="Percent Decrease [%]">
            <b-form-input
                type="number"
                v-model="altModel.rate"
                required
              >
            </b-form-input>
          </b-form-group>
          <b-form-group :label="'Per 1,000 [' + user.elevUnits + ']'">
            <b-form-input
                type="number"
                v-model="altModel.span"
                required
              >
            </b-form-input>
          </b-form-group>
          <b-form-group :label="'Starting at altitude of [' + user.elevUnits + ']'">
            <b-form-input
                type="number"
                v-model="altModel.threshold"
                required
              >
            </b-form-input>
          </b-form-group>
        </b-card>
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
  title: 'Settings',
  props: ['user'],
  data () {
    return {
      customAltModel: false,
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
      ],
      model: {},
      altModel: {}
    }
  },
  async created () {
    if (this.user.hasOwnProperty('altModel') &&
      this.user.altModel.hasOwnProperty('rate')) {
      this.customAltModel = true
      this.altModel = Object.assign({}, this.user.altModel)
    }
  },
  methods: {
    async saveSettings () {
      if (this.customAltModel) {
        this.user.altModel = this.altModel
      } else {
        this.user.altModel = {}
      }
      await api.updateSettings(this.user._id, this.user)
      await api.getUser()
      this.$emit('user', this.user)
      this.$router.go(-1)
    }
  }
}
</script>
