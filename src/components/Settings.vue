<template>
  <div
    class="container-fluid mt-4"
    style="max-width:50rem"
  >
    <h1 class="h1 d-none d-md-block">
      Settings{{ $user.admin ? ' [Admin]' : '' }}
    </h1>
    <b-card ref="settings">
      <form @submit.prevent="saveSettings">
        <b-form-group label="Distance Units">
          <b-form-select
            v-model="model.distUnits"
            :options="distUnits"
          />
        </b-form-group>
        <b-form-group label="Elevation Units">
          <b-form-select
            v-model="model.elevUnits"
            :options="elevUnits"
          />
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
            :label="`Time Increase [%] per ${ altModel.span } m`"
          >
            <b-form-input
              v-model="altModel.rate"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </b-form-group>
          <b-form-group label="Starting at altitude of [m]">
            <b-form-input
              v-model="altModel.th"
              type="number"
              required
            />
          </b-form-group>
        </b-card>
        <div>
          <b-button
            type="submit"
            variant="success"
          >
            Save Settings
          </b-button>
        </div>
      </form>
    </b-card>
    <vue-headful
      description="My ultraPacer settings."
      title="Settings - ultraPacer"
    />
  </div>
</template>

<script>
import api from '@/api'
import { defaults } from '../util/normFactor'
export default {
  title: 'Settings',
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
      altModel: Object.assign({}, defaults.alt),
      model: {}
    }
  },
  watch: {
    '$user._id': function () {
      this.populateForm()
    }
  },
  async created () {
    this.$status.loading = true
    this.populateForm()
  },
  methods: {
    async saveSettings () {
      this.$status.processing = true
      if (!this.customAltModel) {
        this.model.altModel = null
      } else {
        this.model.altModel = this.altModel
      }
      await api.updateSettings(this.$user._id, this.model)
      await api.getUser()
      await this.$parent.getUser()
      this.$status.processing = false
      this.$router.go(-1)
    },
    async populateForm () {
      this.$status.loading = true
      const user = await api.getUser()
      this.model = Object.assign({}, user)
      if (user.altModel !== null) {
        this.customAltModel = true
        this.altModel = Object.assign({}, user.altModel)
      }
      this.$status.loading = false
    }
  }
}
</script>
