<template>
  <div
    class="container-fluid mt-4"
    style="max-width:50rem"
  >
    <h1 class="h1 d-none d-md-block">
      Settings{{ $user.admin ? ' [Admin]' : '' }}
    </h1>
    <b-card>
      <h4>User Information</h4>

      <b-input-group
        prepend="Membership"
      >
        <b-form-input
          v-model="membership"
          disabled
          style="background-color:white; min-width: 75px"
        />
        <b-input-group-append>
          <b-button
            v-if="membership === 'patreon'"
            variant="primary"
            @click="$parent.$refs.support.goToPatreon()"
          >
            <v-icon name="brands/patreon" />
          </b-button>
          <b-button
            v-else-if="membership === 'buymeacoffee'"
            variant="primary"
            @click="$parent.$refs.support.goToBuyMeACoffee()"
          >
            <v-icon name="mug-hot" />
          </b-button>
          <b-button
            v-else
            variant="primary"
            @click="$parent.$refs.support.show"
          >
            Support
          </b-button>
        </b-input-group-append>
      </b-input-group>

      <b-input-group
        prepend="Email"
        class="mt-1"
      >
        <b-form-input
          v-model="$auth.profile.email"
          type="email"
          disabled
          style="background-color:white"
        />
      </b-input-group>
    </b-card>
    <b-card
      ref="settings"
      class="mt-2"
    >
      <h4>User Settings</h4>
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
      altModel: Object.assign({}, this.$core.normFactor.defaults.alt),
      logger: this.$log.child({ file: 'Settings.vue' }),
      model: {}
    }
  },
  computed: {
    membership: function () {
      try {
        if (this.$user?.membership?.active && this.$user?.membership?.method) {
          return this.$user.membership.method
        }
      } catch (error) {
        this.logger.child({ method: 'membership' }).error(error.stack || error)
      }
      return 'free'
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
      await this.$api.updateUser(this.$user._id, this.model)
      await this.$api.getUser()
      await this.$parent.getUser()
      this.$status.processing = false
      this.$router.go(-1)
    },
    async populateForm () {
      this.$status.loading = true
      const user = await this.$api.getUser()
      this.model = Object.assign({}, user)
      if (user.altModel !== null) {
        this.customAltModel = true
        this.altModel = Object.assign({}, user.altModel)
      }
      this.$status.loading = false
    },
    async goToBuyMeACoffee () {
      this.$gtage(this.$gtag, 'BuyMeACoffee', 'visit')
      window.open('https://buymeacoffee.com/ultrapacer', '_blank')
    }
  }
}
</script>
