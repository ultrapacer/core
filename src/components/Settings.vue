<template>
  <div class="container-fluid mt-4">
    <h1 class="h1 d-none d-md-block">Settings</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-card>
      <form @submit.prevent="saveSettings">
        <b-form-group label="Distance Units">
          <b-form-select v-model="model.distUnits" :options="distUnits">
          </b-form-select>
        </b-form-group>
        <b-form-group label="Elevation Units">
          <b-form-select
              v-model="model.elevUnits"
              :options="elevUnits"
              @change="updateAltUnits"
            >
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
          <b-form-group
            :label="'Percent Decrease [%] per 1,000 ' + model.elevUnits"
          >
            <b-form-input
                type="number"
                v-model="model.altModel.rate"
                step="0.01"
                required
              >
            </b-form-input>
          </b-form-group>
          <b-form-group :label="'Starting at altitude of [' + model.elevUnits + ']'">
            <b-form-input
                type="number"
                v-model="model.altModel.thresholdF"
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
      model: {}
    }
  },
  computed: {
    units: function () {
      var u = {
        dist: this.model.distUnits,
        alt: this.model.elevUnits
      }
      u.distScale = (u.dist === 'mi') ? 0.621371 : 1
      u.altScale = (u.alt === 'ft') ? 3.28084 : 1
      return u
    }
  },
  async created () {
    this.populateForm()
  },
  methods: {
    async saveSettings () {
      if (this.customAltModel) {
        this.model.altModel.treshold =
          this.model.altModel.thresholdF / this.units.altScale
      } else {
        this.model.altModel = {}
      }
      await api.updateSettings(this.user._id, this.model)
      await api.getUser()
      Object.assign(this.user, this.model)
      this.$router.go(-1)
    },
    updateAltUnits (val) {

    },
    populateForm () {
      this.model = Object.assign({}, this.user)
      if (this.model.hasOwnProperty('altModel') &&
        this.model.altModel.hasOwnProperty('rate')) {
        this.customAltModel = true
        this.model.altModel.thresholdF =
          this.model.altModel.thresholdF * this.units.altScale
      }
    }
  },
  watch: {
    user: function () {
      this.populateForm()
    }
  }
}
</script>
