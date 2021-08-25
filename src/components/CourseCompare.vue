<template>
  <div>
    <b-modal
      ref="modal"
      centered
      title="Compare to Activity (Beta)"
      @ok="handleOk"
    >
      <form
        ref="compareform"
        style="min-height: 100px"
        @submit.prevent=""
      >
        <p>How'd you do? Select a .GPX file from your race or activity to compare against your plans.</p>
        <p style="color: red">
          This feature is in beta. Contact me if it doesn't work for you.
        </p>
        <b-input-group
          prepend="File"
          class="mb-2"
        >
          <b-form-file
            v-model="gpxFile"
            placeholder="Choose a GPX file..."
            accept=".gpx"
            no-drop
            required
            :state="!Boolean(gpxFileInvalidMsg)"
            @change="loadGPX"
          />
          <b-form-invalid-feedback :state="!Boolean(gpxFileInvalidMsg)">
            {{ gpxFileInvalidMsg }}
          </b-form-invalid-feedback>
        </b-input-group>
        <form-tip v-if="showTips">
          Required: ".gpx" format file exported from your GPS track.
        </form-tip>
      </form>
      <template #modal-footer="{ ok, cancel }">
        <div
          style="text-align: left; flex: auto"
        >
          <b-button
            v-if="comparing"
            variant="warning"
            @click="stop()"
          >
            Stop Comparison
          </b-button>
          <b-button
            size="sm"
            variant="warning"
            @click="showTips = !showTips"
          >
            Tips
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
import moment from 'moment-timezone'
import FormTip from '../forms/FormTip'
const gpxParse = require('gpx-parse')
export default {
  components: {
    FormTip
  },
  props: {
    comparing: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      gpxFile: null,
      gpxFileInvalidMsg: '',
      gpxPoints: [],
      cb: null,
      faildist: 0,
      showTips: false
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
      this.$status.processing = true
      this.$nextTick(async () => {
        if (this.gpxPoints.length) {
          this.$core.geo.addLoc(this.gpxPoints)
        }
        const result = await this.cb(this.gpxPoints)
        if (result.match) {
          this.$refs.modal.hide()
        } else {
          this.faildist = result.point.loc
          this.$refs['toast-match-error'].show()
        }
        this.$status.processing = false
      })
    },
    async loadGPX (f) {
      this.$status.processing = true
      this.$nextTick(async () => {
        const reader = new FileReader()
        reader.onload = e => {
          gpxParse.parseGpx(e.target.result, (error, data) => {
            if (error) {
              this.gpxFileInvalidMsg = `File format invalid: ${error.toString()}`
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
              this.gpxFileInvalidMsg = ''
            }
          })
        }
        reader.readAsText(f.target.files[0])
        this.$status.processing = false
      })
    },
    async stop () {
      this.$emit('stop', () => {
        this.$refs.modal.hide()
      })
    }
  }
}
</script>
