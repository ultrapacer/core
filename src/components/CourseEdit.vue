<template>
  <div>
    <b-modal
      ref="modal"
      centered
      :title="(model._id ? 'Edit' : 'New') + ' Course'"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <form
        ref="courseform"
        style="min-height: 100px"
        @submit.prevent=""
      >
        <b-input-group
          prepend="File"
          class="mb-2"
          size="sm"
        >
          <b-form-file
            v-model="gpxFile"
            size="sm"
            :placeholder="(model.source) ? model.source.name : 'Choose a GPX file...'"
            accept=".gpx"
            no-drop
            :required="!Boolean(model.source)"
            :state="!Boolean(gpxFileInvalidMsg)"
            @change="loadGPX"
          />
          <b-form-invalid-feedback :state="!Boolean(gpxFileInvalidMsg)">
            {{ gpxFileInvalidMsg }}
          </b-form-invalid-feedback>
        </b-input-group>
        <form-tip v-if="showTips">
          Required: ".gpx" format file exported from a GPS track or route builder.
        </form-tip>
        <div v-if="courseLoaded === true || model._id">
          <b-input-group
            prepend="Name"
            class="mb-2"
            size="sm"
          >
            <b-form-input
              v-model="model.name"
              type="text"
              required
            />
          </b-input-group>
          <form-tip v-if="showTips">
            Required: name for the course; for example: "Western States 100".
          </form-tip>
          <b-input-group
            prepend="Description"
            class="mb-2"
            size="sm"
          >
            <b-form-textarea
              v-model="model.description"
              rows="2"
            />
          </b-input-group>
          <form-tip v-if="showTips">
            Optional: description for your course or race.
          </form-tip>
          <form-date-time
            v-model="moment"
            :show-tips="showTips"
          >
            <template #date-tip>
              Optional: use for organized races. Plans made for this course can set thier own times.
            </template>
          </form-date-time>
          <b-form-checkbox
            v-model="model.override.enabled"
            size="sm"
            class="mb-2"
            :unchecked-value="false"
            @change="setDistGainLoss"
          >
            Override distance/gain/loss from GPX file
          </b-form-checkbox>
          <form-tip v-if="showTips">
            Optional: enable to manually specify distance/elevation.
          </form-tip>
          <b-form-group
            v-if="model.override.enabled"
            class="mb-0 pl-3"
          >
            <b-input-group
              prepend="Distance"
              class="mb-2"
              size="sm"
            >
              <b-form-input
                v-model="distancef"
                type="number"
                required
                step="0.01"
                :min="round((stats ? stats.dist : model.distance) * ((model.override.distUnit === 'mi') ? 0.621371 : 1) * 0.9, 2)"
                :max="round((stats ? stats.dist : model.distance) * ((model.override.distUnit === 'mi') ? 0.621371 : 1) * 1.1, 2)"
                @change="updateDistance"
              />
              <b-form-select
                v-model="model.override.distUnit"
                :options="distUnits"
                required
                @change="updateDistanceUnit"
              />
            </b-input-group>
            <form-tip v-if="showTips">
              Required (if Override is enabled): specify distance and units.
            </form-tip>
            <b-input-group
              prepend="Elevation Gain"
              class="mb-2"
              size="sm"
            >
              <b-form-input
                v-model="gainf"
                type="number"
                required
                step="0"
                :min="round((stats ? stats.gain : model.gain) * ((model.override.elevUnit === 'ft') ? 3.28084 : 1) * 0.8, 0)"
                :max="round((stats ? stats.gain : model.gain) * ((model.override.elevUnit === 'ft') ? 3.28084 : 1) * 1.2, 0)"
                @change="updateGain"
              />
              <b-form-select
                v-model="model.override.elevUnit"
                :options="elevUnits"
                required
                @change="updateElevUnit"
              />
            </b-input-group>
            <form-tip v-if="showTips">
              Required (if Override is enabled): specify climbing/gain and units.
            </form-tip>
            <b-input-group
              prepend="Elevation Loss"
              class="mb-2"
              size="sm"
            >
              <b-form-input
                v-model="lossf"
                type="number"
                required
                step="0"
                :min="round(-(stats ? stats.loss : model.gain) * ((model.override.elevUnit === 'ft') ? 3.28084 : 1) * 0.8, 0)"
                :max="round(-(stats ? stats.loss : model.gain) * ((model.override.elevUnit === 'ft') ? 3.28084 : 1) * 1.2, 0)"
                @change="updateLoss"
              />
              <b-form-select
                v-model="model.override.elevUnit"
                :options="elevUnits"
                required
                @change="updateElevUnit"
              />
            </b-input-group>
            <form-tip v-if="showTips">
              Required (if Override is enabled): specify descent/loss and units.
            </form-tip>
          </b-form-group>
          <b-form-checkbox
            v-model="model.public"
            :value="true"
            size="sm"
            class="mb-2"
            :unchecked-value="false"
          >
            Visible to public
          </b-form-checkbox>
          <form-tip v-if="showTips">
            Optional: allow link sharing for course and plans (to anybody).
          </form-tip>
          <b-input-group
            v-if="model.public && $user.admin"
            prepend="Permalink"
            class="mb-2"
            size="sm"
          >
            <b-form-input
              v-model="model.link"
              type="text"
            />
          </b-input-group>
          <form-tip v-if="model.public && $user.admin && showTips">
            Optional: readable link for official races; https://ultrapacer.com/race/(permalink).
          </form-tip>
        </div>
      </form>
      <template #modal-footer="{ ok, cancel }">
        <div
          style="text-align: left; flex: auto"
        >
          <b-button
            size="sm"
            variant="warning"
            @click="$refs.help.show()"
          >
            Docs
          </b-button>
          <b-button
            size="sm"
            variant="warning"
            @click="toggleTips()"
          >
            Tips
          </b-button>
        </div>
        <b-button
          v-if="model._id"
          variant="danger"
          @click="remove"
        >
          Delete
        </b-button>
        <b-button
          variant="secondary"
          @click="cancel()"
        >
          Cancel
        </b-button>
        <b-button
          variant="primary"
          :disabled="courseLoaded !== true"
          @click="ok()"
        >
          Save
        </b-button>
      </template>
    </b-modal>
    <b-modal
      ref="help"
      :title="`Course ${model._id ? 'Edit' : 'Create'} Help`"
      size="lg"
      scrollable
      ok-only
    >
      <help-doc class="documentation" />
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'
import geo from '@/util/geo'
import FormDateTime from './FormDateTime'
import FormTip from './FormTip'
import HelpDoc from '@/docs/course.md'
import moment from 'moment-timezone'
import wputil from '@/util/waypoints'
import { round } from '@/util/math'
const gpxParse = require('gpx-parse')
export default {
  components: {
    HelpDoc,
    FormDateTime,
    FormTip
  },
  data () {
    return {
      courseLoaded: false,
      defaults: {
        override: {
          enabled: false,
          distUnit: 'mi',
          elevUnit: 'ft'
        }
      },
      distUnits: [
        { value: 'mi', text: 'mi' },
        { value: 'km', text: 'km' }
      ],
      elevUnits: [
        { value: 'ft', text: 'ft' },
        { value: 'm', text: 'm' }
      ],
      gpxFile: null,
      gpxFileInvalidMsg: '',
      gpxPoints: [],
      model: {},
      moment: null,
      rawLoaded: false,
      showTips: false,
      stats: null,
      distancef: null,
      gainf: null,
      lossf: null
    }
  },
  methods: {
    async show (course, raw = null) {
      this.courseLoaded = false
      this.showTips = false
      this.moment = null
      if (course._id) {
        this.model = Object.assign({}, course)
        const tz = this.model.eventTimezone || moment.tz.guess()
        if (this.model.eventStart) {
          this.moment = moment(this.model.eventStart).tz(tz)
        } else {
          this.moment = moment(0).tz(tz)
        }
        this.model.override = { ...course.override }
        this.updateDistanceUnit(this.model.override.distUnit)
        this.updateElevUnit(this.model.override.elevUnit)
        this.courseLoaded = this.reloadRaw()
      } else {
        this.moment = moment(0).tz(moment.tz.guess())
        this.model = Object.assign({}, this.defaults)
      }
      this.$refs.modal.show()
      this.$status.processing = false
    },
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      if (this.$refs.courseform.reportValidity()) {
        this.save()
      }
    },
    async reloadRaw () {
      const raw = await api.getCourseField(this.model._id, 'raw')
      this.gpxPoints = raw.map(p => {
        return { lat: p[0], lon: p[1], alt: p[2] }
      })
      geo.addLoc(this.gpxPoints)
      this.stats = geo.calcStats(this.gpxPoints, true)
      this.courseLoaded = true
      return true
    },
    async save () {
      if (this.$status.processing) { return }
      this.$status.processing = true
      if (this.gpxPoints.length) {
        const points = this.gpxPoints

        const reduced = geo.reduce(points, this.model.distance)
        // reformat points for upload
        this.model.points = reduced.map(x => {
          return [
            x.loc,
            round(x.lat, 6),
            round(x.lon, 6),
            round(x.alt, 2),
            round(x.grade, 4)
          ]
        })

        this.model.raw = points.map(x => {
          return [x.lat, x.lon, x.alt]
        })

        if (this.model._id) {
          // update all waypoints to fit updated course:
          const waypoints = await api.getWaypoints(this.model._id)
          const finish = waypoints.find(wp => wp.type === 'finish')
          const olddist = finish.location
          if (round(finish.location, 4) !== round(this.model.distance, 4)) {
            console.log('Scaling waypoints')
            await Promise.all(waypoints.map(async wp => {
              const t = this.$logger()
              const wpold = wp.location
              // scale waypoint location for new course distance:
              if (wp.type === 'finish') {
                wp.location = this.model.distance
              } else if (wp.type !== 'start') {
                wp.location = wp.location * this.model.distance / olddist
              }
              // if there is a new source file, try to find nearest location:
              if (this.model.source) {
                if (wp.type !== 'start' && wp.type !== 'finish') {
                  try {
                    const wpdelta = Math.abs(wpold - wp.location)
                    // iteration threshold th:
                    const th = Math.max(0.5, Math.min(wpdelta, this.model.distance))
                    // resolve closest distance for waypoint LLA
                    wp.location = wputil.nearestLoc(wp, reduced, th)
                  } catch (err) {
                    console.log(err)
                  }
                }
                wputil.updateLLA(wp, reduced)
              }
              await api.updateWaypoint(wp._id, wp)
              this.$logger(`CourseEdit|save|adjustWaypoint: ${wp.name}`, t)
            }))
          }
        }
      }

      this.model.eventTimezone = this.moment.tz()
      if (Number(this.moment.format('YYYY') > 1970)) {
        this.model.eventStart = this.moment.toDate()
      } else {
        this.model.eventStart = null
      }

      if (this.model._id) {
        const updateModel = {}
        const fields = [
          'name',
          'link',
          'description',
          'public',
          'eventStart',
          'eventTimezone',
          'points',
          'raw',
          'source',
          'distance',
          'gain',
          'loss',
          'override',
          'distance',
          'gain',
          'loss'
        ]
        fields.forEach(f => {
          if (this.model[f] !== undefined) {
            updateModel[f] = this.model[f]
          }
        })
        if (!updateModel.public) { updateModel.link = null }
        await api.updateCourse(this.model._id, updateModel)
        this.$ga.event('Course', 'edit')
      } else {
        await api.createCourse(this.model)
        this.$ga.event('Course', 'create')
      }
      this.$emit('refresh', () => {
        this.$status.processing = false
        this.clear()
        this.$refs.modal.hide()
      })
    },
    clear () {
      this.model = Object.assign({}, this.defaults)
    },
    async remove () {
      this.$emit('delete', this.model, async (err) => {
        if (!err) {
          this.$ga.event('Course', 'delete')
          this.$refs.modal.hide()
        }
      })
    },
    async loadGPX (f) {
      this.$status.processing = true
      const t = this.$logger()
      this.$nextTick(async () => {
        const reader = new FileReader()
        reader.onload = e => {
          gpxParse.parseGpx(e.target.result, async (error, data) => {
            if (error) {
              this.gpxFileInvalidMsg = `File format invalid: ${error.toString()}`
              this.$status.processing = false
              throw error
            } else {
              this.$logger('CourseEdit|GPX parsed', t)
              this.gpxPoints = data.tracks[0].segments[0].map(p => {
                return {
                  alt: p.elevation,
                  lat: p.lat,
                  lon: p.lon
                }
              })
              if (this.gpxPoints.length < 100) {
                this.gpxFileInvalidMsg = 'GPX file has too few points.'
                this.$status.processing = false
                return
              }
              geo.addLoc(this.gpxPoints)
              this.stats = geo.calcStats(this.gpxPoints, true)
              if (this.stats.gain === 0) {
                this.gpxFileInvalidMsg = 'GPX file does not contain elevation data.'
                this.$status.processing = false
                return
              }
              this.gpxFileInvalidMsg = ''
              this.model.gain = this.stats.gain
              this.model.loss = this.stats.loss
              this.model.distance = this.stats.dist
              this.setDistGainLoss()
              this.model.source = {
                type: 'gpx',
                name: this.gpxFile.name
              }
              await this.defaultTimezone(this.gpxPoints[0].lat, this.gpxPoints[0].lon)
              this.courseLoaded = true
              this.$status.processing = false
            }
          })
        }
        reader.readAsText(f.target.files[0])
      })
    },
    setDistGainLoss: async function (val = false) {
      this.model.override.distUnit = this.$units.dist
      this.model.override.elevUnit = this.$units.alt
      if (!val) {
        if (this.courseLoaded !== true) {
          this.$status.processing = true
          await this.courseLoaded
          this.$status.processing = false
        }
        this.model.gain = this.stats.gain
        this.model.loss = this.stats.loss
        this.model.distance = this.stats.dist
        this.updateDistanceUnit(this.model.override.distUnit)
        this.updateElevUnit(this.model.override.elevUnit)
      } else {
        this.updateDistanceUnit(this.$units.dist)
        this.updateElevUnit(this.$units.alt)
      }
      this.$set(this.model.override, 'enabled', val)
    },
    updateDistance: function (val) {
      this.model.distance = val / ((this.model.override.distUnit === 'mi') ? 0.621371 : 1)
    },
    async updateDistanceUnit (val) {
      this.distancef = round(this.model.distance * ((val === 'mi') ? 0.621371 : 1), 2)
    },
    updateGain: function (val) {
      this.model.gain = val / ((this.model.override.elevUnit === 'ft') ? 3.28084 : 1)
    },
    updateLoss: function (val) {
      this.model.loss = -val / ((this.model.override.elevUnit === 'ft') ? 3.28084 : 1)
    },
    async updateElevUnit (val) {
      this.gainf = round(this.model.gain * ((val === 'ft') ? 3.28084 : 1), 0)
      this.lossf = -round(this.model.loss * ((val === 'ft') ? 3.28084 : 1), 0)
    },
    async defaultTimezone (lat, lon) {
      const tz = await api.getTimeZone(lat, lon)
      if (Number(this.moment.format('YYYY') > 1970)) {
        this.moment = moment(this.moment.format('YYYY-MM-DD kk:mm')).tz(tz)
      } else {
        this.moment = moment(0).tz(tz)
      }
    },
    round: function (val, dec) {
      return round(val, dec)
    },
    showHelp () {
      this.$refs.help.show()
    },
    toggleTips () {
      this.showTips = !this.showTips
    }
  }
}
</script>
