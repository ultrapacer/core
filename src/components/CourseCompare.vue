<template>
  <div>
    <b-modal
      id="course-compare-modal"
      centered
      title="Compare to Activity (Beta)"
      @ok="handleOk"
    >
    <p>How'd you do? Select a .GPX file from your race or activity to compare against your plans.</p>
    <p style="color: red">This feature is in beta. Contact me if it doesn't work for you.</p>
      <form ref="compareform" @submit.prevent="">
        <b-input-group
          prepend="File"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'File: GPX format file exported from a GPS track.'
          "
        >
          <b-form-file
            size="sm"
            v-model="gpxFile"
            placeholder="Choose a GPX file..."
            accept=".gpx"
            @change="loadGPX"
            no-drop
            required
          ></b-form-file>
        </b-input-group>
      </form>
      <template slot="modal-footer" slot-scope="{ ok, cancel }">
        <div
          v-if="comparing"
          style="text-align: left; flex: auto">
          <b-button size="sm" variant="warning" @click="stop()">
            Stop Comparison
          </b-button>
        </div>
        <b-button variant="secondary" @click="cancel()">
          Cancel
        </b-button>
        <b-button variant="primary" @click="ok()">
          <b-spinner v-show="saving" small></b-spinner>
          Load
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import geo from '@/util/geo'
import moment from 'moment-timezone'
const gpxParse = require('gpx-parse')
export default {
  props: ['user', 'comparing'],
  data () {
    return {
      gpxFile: null,
      gpxPoints: [],
      saving: false,
      cb: null
    }
  },
  methods: {
    async show (cb) {
      this.cb = cb
      this.$bvModal.show('course-compare-modal')
    },
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      if (this.$refs.compareform.reportValidity()) {
        this.save()
      }
    },
    async save () {
      if (this.saving) { return }
      this.saving = true
      if (this.gpxPoints.length) {
        geo.addLoc(this.gpxPoints)
      }
      await this.cb(this.gpxPoints)
      this.$bvModal.hide('course-compare-modal')
      this.saving = false
    },
    async loadGPX (f) {
      const reader = new FileReader()
      reader.onload = e => {
        gpxParse.parseGpx(e.target.result, (error, data) => {
          if (error) {
            throw error
          } else {
            let startTime = moment(data.tracks[0].segments[0][0].time)
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
        this.$bvModal.hide('course-compare-modal')
      })
    }
  }
}
</script>
