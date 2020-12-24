<template>
  <div>
    <b-modal
      ref="modal"
      centered
      title="Compare to Activity (Beta)"
      @ok="handleOk"
    >
      <p>How'd you do? Select a .GPX file from your race or activity to compare against your plans.</p>
      <p style="color: red">
        This feature is in beta. Contact me if it doesn't work for you.
      </p>
      <form
        ref="compareform"
        @submit.prevent=""
      >
        <b-input-group
          v-b-popover.hover.bottomright.d250.v-info="
            'File: GPX format file exported from a GPS track.'
          "
          prepend="File"
          class="mb-2"
          size="sm"
        >
          <b-form-file
            v-model="gpxFile"
            size="sm"
            placeholder="Choose a GPX file..."
            accept=".gpx"
            no-drop
            required
            @change="loadGPX"
          />
        </b-input-group>
      </form>
      <template #modal-footer="{ ok, cancel }">
        <div
          v-if="comparing"
          style="text-align: left; flex: auto"
        >
          <b-button
            size="sm"
            variant="warning"
            @click="stop()"
          >
            Stop Comparison
          </b-button>
        </div>
        <b-button
          variant="secondary"
          @click="cancel()"
        >
          Cancel
        </b-button>
        <b-button
          variant="primary"
          @click="ok()"
        >
          <b-spinner
            v-show="loading"
            small
          />
          Load
        </b-button>
      </template>
    </b-modal>
    <b-toast
      ref="toast-match-error"
      title="Matching Error"
      toaster="b-toaster-bottom-right"
      solid
      variant="danger"
      auto-hide-delay="5000"
    >
      Activity diverged from Course at {{ $units.distf(faildist, 2) }} {{ $units.dist }}.
    </b-toast>
  </div>
</template>

<script>
import geo from '@/util/geo'
import moment from 'moment-timezone'
const gpxParse = require('gpx-parse')
export default {
  props: {
    comparing: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      gpxFile: null,
      gpxPoints: [],
      loading: false,
      cb: null,
      faildist: 0
    }
  },
  methods: {
    async show (cb) {
      this.cb = cb
      this.$refs.modal.show()
    },
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      if (this.$refs.compareform.reportValidity()) {
        this.load()
      }
    },
    async load () {
      if (this.loading) { return }
      this.loading = true
      if (this.gpxPoints.length) {
        geo.addLoc(this.gpxPoints)
      }
      const result = await this.cb(this.gpxPoints)
      if (result.match) {
        this.$refs.modal.hide()
      } else {
        this.faildist = result.point.loc
        this.$refs['toast-match-error'].show()
      }
      this.loading = false
    },
    async loadGPX (f) {
      const reader = new FileReader()
      reader.onload = e => {
        gpxParse.parseGpx(e.target.result, (error, data) => {
          if (error) {
            throw error
          } else {
            const startTime = moment(data.tracks[0].segments[0][0].time)
            this.gpxPoints = data.tracks[0].segments[0].map(p => {
              return {
                alt: p.elevation,
                lat: p.lat,
                lon: p.lon,
                elapsed: moment(p.time).diff(startTime, 'seconds')
              }
            })
          }
        })
      }
      reader.readAsText(f.target.files[0])
    },
    async stop () {
      this.$emit('stop', () => {
        this.$refs.modal.hide()
      })
    }
  }
}
</script>
