<template>
  <b-form-group style="width:100%">
    <b-input-group
      prepend="ID/Path"
    >
      <b-form-input
        v-model="stravaRouteId"
        type="text"
        required
        @change="stravaRouteIdChange"
      />
      <b-button
        variant="success"
        :disabled="!stravaRouteId || isNaN(Number(stravaRouteId))"
        @click="getStravaRoute"
      >
        {{ stravaRouteName ? 'Reload' : 'Load' }}
      </b-button>
    </b-input-group>
    <form-tip v-if="showTips">
      Required: Enter the ID number or full path to the route on Strava (typically https://www.strava.com/routes/[id-number])
    </form-tip>

    <b-row v-if="stravaRouteName">
      <b-col
        cols="4"
        sm="3"
        lg="3"
        class="text-right pr-0"
      >
        Name:
      </b-col>
      <b-col>{{ stravaRouteName }}</b-col>
    </b-row>
    <b-row v-if="stravaRouteDate">
      <b-col
        cols="4"
        sm="3"
        lg="3"
        class="text-right pr-0"
      >
        Modified:
      </b-col>
      <b-col>{{ stravaRouteDate }}</b-col>
    </b-row>
    <b-row v-if="stravaRouteId">
      <b-col
        cols="4"
        sm="3"
        lg="3"
        class="text-right pr-0"
      >
        Link:
      </b-col>
      <b-col>
        <b-link
          :href="`https://strava.com/routes/${stravaRouteId}`"
          target="_blank"
        >
          View on Strava
        </b-link>
      </b-col>
    </b-row>
    <b-form-invalid-feedback :state="stravaRouteInvalid===false">
      Unable to load from Strava; please check that ID is correct.
    </b-form-invalid-feedback>
  </b-form-group>
</template>

<script>
import api from '@/api'
import FormTip from './FormTip'
export default {
  components: {
    FormTip
  },
  props: {
    showTips: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      stravaRouteId: null,
      stravaRouteName: null,
      stravaRouteDate: null,
      stravaRouteInvalid: false
    }
  },
  computed: {
    mysource: function () {
      return {
        type: 'strava-route',
        alt: 'strava-route',
        id: this.stravaRouteId,
        last_modified: this.stravaRouteDate,
        name: this.stravaRouteName
      }
    }
  },
  mounted () {
    if (this.value.type === 'strava-route') {
      this.stravaRouteId = this.value.id || null
      this.stravaRouteName = this.value.name || null
      this.stravaRouteDate = this.value.last_modified || null
    }
  },
  methods: {
    async getStravaRoute () {
      this.$status.processing = true
      try {
        const [route, gpx] = await Promise.all([
          this.$utils.timeout(api.getStravaRoute(this.stravaRouteId), 15000),
          this.$utils.timeout(api.getStravaRouteGPX(this.stravaRouteId), 15000)
        ])
        this.stravaRouteName = route.name
        this.stravaRouteDate = route.updated_at

        this.$emit('loadGPX', gpx, this.mysource)
      } catch (err) {
        console.log(err)
        this.stravaRouteName = null
        this.stravaRouteDate = null

        this.stravaRouteInvalid = true
        this.$status.processing = false
      }
    },
    stravaRouteIdChange (v) {
      const val = v.split('/')
      if (val.length === 1) {
        this.stravaRouteId = val[0]
      } else {
        const i = val.findIndex(x => x === 'routes')
        this.stravaRouteId = val[i + 1]
      }
      this.stravaRouteInvalid = false
      this.$emit('change')
    }
  }
}
</script>
