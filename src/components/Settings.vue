<template>
  <div class="container-fluid mt-4" style="max-width:50rem">
    <h1 class="h1 d-none d-md-block">Settings{{ user.admin ? ' [Admin]' : '' }}</h1>
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
            :label="`Time Increase [%] per ${ altModel.span } m`"
          >
            <b-form-input
                type="number"
                v-model="altModel.rate"
                min="0"
                step="0.01"
                required
              >
            </b-form-input>
          </b-form-group>
          <b-form-group label="Starting at altitude of [m]">
            <b-form-input
                type="number"
                v-model="altModel.th"
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
    <vue-headful
      description="My ultraPacer settings."
      title="Settings - ultraPacer"
    />
  </div>
</template>

<script>
import api from '@/api'
import {defaults} from '../util/normFactor'
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
      altModel: Object.assign({}, defaults.alt),
      model: {}
    }
  },
  async created () {
    this.populateForm()
  },
  methods: {
    async saveSettings () {
      if (!this.customAltModel) {
        this.model.altModel = null
      } else {
        this.model.altModel = this.altModel
      }
      await api.updateSettings(this.user._id, this.model)
      await api.getUser()
      Object.keys(this.model).forEach(x => {
        this.user[x] = this.model[x]
      })
      this.$router.go(-1)
    },
    populateForm () {
      this.model = Object.assign({}, this.user)
      if (this.user.altModel !== null) {
        this.customAltModel = true
        this.altModel = Object.assign({}, this.user.altModel)
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
