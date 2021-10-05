<template>
  <div>
    <b-modal
      ref="modal"
      centered
      title="Compare to Activity (Beta)"
      @ok="handleOk"
      @hide="handleHide"
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
            :placeholder="filename && comparing ? filename : 'Choose a GPX file...'"
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
      filename: '',
      gpxFile: null,
      gpxFileInvalidMsg: '',
      gpxPoints: [],
      cb: null,
      faildist: 0,
      showTips: false,
      startTime: null
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
    handleHide (bvModalEvt) {
      const cancelEvents = ['esc', 'cancel', 'headerclose', 'backdrop']
      if (cancelEvents.includes(bvModalEvt.trigger)) this.$emit('cancel')
    },
    async load () {
      this.$status.processing = true
      this.$nextTick(async () => {
        try {
          const result = await this.cb(this.gpxPoints, this.startTime)
          if (result.match) {
            this.$refs.modal.hide()
          } else {
            this.faildist = result.point.loc
            this.$refs['toast-match-error'].show()
          }
        } catch (error) {
          this.$error.handle(this.$gtag, error)
        }
        this.$status.processing = false
      })
    },
    async loadGPX (f) {
      this.$status.processing = true
      await this.$core.util.sleep(100)
      this.$nextTick(async () => {
        const reader = new FileReader()
        reader.onload = e => {
          this.filename = this.gpxFile.name
          this.$logger(`CourseCompare|loadGPX : loaded ${this.filename} loaded.`)
          gpxParse.parseGpx(e.target.result, async (error, data) => {
            if (error) {
              this.gpxFileInvalidMsg = `File format invalid: ${error.toString()}`
              this.$status.processing = false
              throw error
            } else {
              this.startTime = moment(data.tracks[0].segments[0][0].time)
              const gpxpoints = data.tracks[0].segments[0].map(p => {
                return [p.lat, p.lon, p.elevation]
              })
              this.gpxPoints = await this.$core.tracks.create(gpxpoints, { clean: false })

              // add in elapsed time:
              this.gpxPoints.forEach((p, i) => {
                p.elapsed = moment(data.tracks[0].segments[0][i].time).diff(this.startTime, 'seconds')
              })

              this.gpxFileInvalidMsg = ''
            }
            this.$status.processing = false
          })
        }
        reader.readAsText(f.target.files[0])
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
