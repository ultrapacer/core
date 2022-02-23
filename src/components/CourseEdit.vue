<template>
  <div>
    <b-modal
      ref="modal"
      centered
      :title="(model._id ? 'Edit' : 'New') + ' Course'"
      hide-header-close
      :no-close-on-esc="$status.processing"
      :no-close-on-backdrop="$status.processing"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <form
        ref="courseform"
        style="min-height: 100px"
        @submit.prevent=""
      >
        <selectable-label-input
          v-model="model.source.type"
          :options="sourceOptions"
          @input="sourceChange"
        >
          <b-form-file
            v-if="model.source.type==='gpx'"
            v-model="gpxFile"
            :placeholder="(model.source) ? model.source.name : 'Choose a GPX file...'"
            accept=".gpx"
            no-drop
            :required="!Boolean(model.source)"
            :state="!Boolean(gpxFileInvalidMsg)"
            @change="loadFile"
          />
          <b-form-invalid-feedback :state="!Boolean(gpxFileInvalidMsg)">
            {{ gpxFileInvalidMsg }}
          </b-form-invalid-feedback>
          <form-tip v-if="model.source.type==='gpx' && showTips">
            Required: ".gpx" format file exported from a GPS track or route builder.
          </form-tip>
          <strava-route-input
            v-if="model.source.type==='strava-route'"
            ref="stravaRouteInput"
            v-model="model.source"
            :show-tips="showTips"
            class="mb-0"
            @loadGPX="loadGPX"
            @change="trackLoaded=false"
          />

          <b-input-group
            v-if="trackLoaded === true || model._id"
            prepend="Elevation Data"
            class="mt-1"
          >
            <b-form-select
              v-model="model.source.alt"
              type="number"
              :options="altSourceOptions"
              required
              @input="changeAltSource"
            />
          </b-input-group>
          <form-tip v-if="model.source.type==='gpx' && showTips">
            Required: data source for elevation.
          </form-tip>
          <b-input-group
            v-if="trackLoaded === true"
            prepend="Stats"
            class="mt-1"
          >
            <div
              class="form-control form-group p-1 mb-0"
              style="height:auto"
            >
              <b-row>
                <b-col
                  cols="4"
                  sm="3"
                  lg="3"
                  class="text-right pr-0"
                >
                  Dist:
                </b-col>
                <b-col>{{ $units.distf(track.dist, 2) | commas }}  {{ $units.dist }}</b-col>
              </b-row>
              <b-row>
                <b-col
                  cols="4"
                  sm="3"
                  lg="3"
                  class="text-right pr-0"
                >
                  Gain:
                </b-col>
                <b-col>{{ $units.altf(track.gain, 0) | commas }}  {{ $units.alt }}</b-col>
              </b-row>
              <b-row>
                <b-col
                  cols="4"
                  sm="3"
                  lg="3"
                  class="text-right pr-0"
                >
                  Loss:
                </b-col>
                <b-col>{{ -$units.altf(track.loss, 0) | commas }}  {{ $units.alt }}</b-col>
              </b-row>
            </div>
          </b-input-group>
        </selectable-label-input>
        <div v-if="trackLoaded === true || model._id">
          <b-input-group
            prepend="Name"
            class="mt-1"
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
            class="mt-1"
          >
            <b-form-textarea
              v-model="model.description"
              rows="2"
            />
          </b-input-group>
          <form-tip v-if="showTips">
            Optional: description for your course or race.
          </form-tip>

          <!--- Organized Event Specific Inputs --->
          <b-form-checkbox
            v-model="model.race"
            :value="true"
            :unchecked-value="false"
            class="mt-1"
            @change="toggleRace"
          >
            Organized event
          </b-form-checkbox>
          <form-tip v-if="showTips">
            Optional: course is for organized race (enables times, cut-offs and such things).
          </form-tip>
          <b-form-group
            v-if="model.race"
            class="mb-0 pl-3"
          >
            <date-time-input
              v-model="moment"
              :show-tips="showTips"
            >
              <template #date-tip>
                Optional: use for organized races. Plans made for this course can set thier own times.
              </template>
            </date-time-input>
            <div v-if="moment.unix()">
              <b-input-group
                prepend="Race Cutoff"
                :append="cutoffTOD"
                class="mt-1"
              >
                <time-input
                  v-model="model.cutoff"
                  format="hh:mm"
                />
              </b-input-group>
              <form-tip v-if="showTips">
                Optional: time limit for course from start (hh:mm)
              </form-tip>
            </div>
          </b-form-group>

          <!--- Override Inputs --->
          <b-form-checkbox
            v-model="model.override.enabled"
            class="mt-1"
            :unchecked-value="false"
            @change="setDistGainLoss"
          >
            Override distance/gain/loss from source <span v-if="loopEnabled">(single loop)</span>
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
              class="mt-1"
            >
              <b-form-input
                v-model="distf"
                type="number"
                required
                step="0.01"
                :min="$math.round((track.dist || model.distance) * ((model.override.distUnit === 'mi') ? 0.621371 : 1) * 0.9, 2)"
                :max="$math.round((track.dist || model.distance) * ((model.override.distUnit === 'mi') ? 0.621371 : 1) * 1.1, 2)"
                @input="updateDistance"
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
              class="mt-1"
            >
              <b-form-input
                v-model="gainf"
                type="number"
                required
                step="0"
                :min="$math.round((track.gain || model.gain) * ((model.override.elevUnit === 'ft') ? 3.28084 : 1) * 0.8, 0)"
                :max="$math.round((track.gain || model.gain) * ((model.override.elevUnit === 'ft') ? 3.28084 : 1) * 1.2, 0)"
                @input="updateGain"
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
              class="mt-1"
            >
              <b-form-input
                v-model="lossf"
                type="number"
                required
                step="0"
                :min="$math.round(-(track.loss || model.loss) * ((model.override.elevUnit === 'ft') ? 3.28084 : 1) * 0.8, 0)"
                :max="$math.round(-(track.loss || model.loss) * ((model.override.elevUnit === 'ft') ? 3.28084 : 1) * 1.2, 0)"
                @input="updateLoss"
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

          <!-- Loop Inputs --->
          <b-form-checkbox
            v-model="loopEnabled"
            class="mt-1"
            :unchecked-value="false"
            @change="toggleLoop"
          >
            Loop course
          </b-form-checkbox>
          <form-tip v-if="showTips">
            Optional: enable to loop course track multiple times.
          </form-tip>
          <b-form-group
            v-if="loopEnabled"
            class="mb-0 pl-3"
          >
            <b-input-group
              prepend="Loops"
              class="mt-1"
            >
              <b-form-input
                v-model="model.loops"
                type="number"
                step="1"
                min="2"
                required
              />
            </b-input-group>
          </b-form-group>

          <!-- Public/Sharing Inputs --->
          <b-form-checkbox
            v-model="model.public"
            :value="true"
            class="mt-1"
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
            class="mt-1"
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
          v-if="model._id && model.meta.deletable"
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
          :disabled="Boolean(!model._id && !trackLoaded)"
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
import DateTimeInput from '../forms/DateTimeInput'
import FormTip from '../forms/FormTip'
import TimeInput from '../forms/TimeInput'
import HelpDoc from '@/docs/course.md'
import SelectableLabelInput from '../forms/SelectableLabelInput'
import StravaRouteInput from '../forms/StravaRouteInput'
import moment from 'moment-timezone'
const gpxParse = require('gpx-parse')
export default {
  components: {
    DateTimeInput,
    FormTip,
    HelpDoc,
    StravaRouteInput,
    SelectableLabelInput,
    TimeInput
  },
  data () {
    return {
      trackLoaded: false,
      newTrack: false,
      defaults: {
        override: {
          enabled: false,
          distUnit: 'mi',
          elevUnit: 'ft'
        },
        source: { type: 'gpx' }
      },
      distUnits: [
        { value: 'mi', text: 'mi' },
        { value: 'km', text: 'km' }
      ],
      elevUnits: [
        { value: 'ft', text: 'ft' },
        { value: 'm', text: 'm' }
      ],
      file: null,
      gpxFile: null,
      gpxFileInvalidMsg: '',
      gpxFileNoElevFlag: false,
      logger: this.$log.child({ file: 'CourseEdit.vue' }),
      loopEnabled: false,
      model: { source: {} },
      moment: null,
      track: [],
      showTips: false,
      distf: null,
      gainf: null,
      lossf: null,
      sourceOptions: [
        { value: 'gpx', text: 'GPX File' },
        { value: 'strava-route', text: 'Strava Route' }
      ]
    }
  },
  computed: {
    altSourceOptions: function () {
      const arr = []
      if (this.model.source) {
        if (this.model.source.type === 'strava-route') {
          arr.push({ value: 'strava-route', text: 'Strava Route' })
        } else if (this.model.source.alt === 'gpx' || (this.file && !this.gpxFileNoElevFlag)) {
          arr.push({ value: 'gpx', text: 'GPX File' })
        }
        arr.push(
          { value: 'google', text: 'Google' },
          { value: 'elevation-api', text: 'Elevation API' }
        )
      }
      return arr
    },
    cutoffTOD: function () {
      // string showing time of day for cutoff value entered
      if (!this.model) return ''
      if (!(this.moment.unix() && this.model?.cutoff)) return ''
      const startSeconds = this.$utils.time.string2sec(this.moment.format('kk:mm:ss'))
      return this.$utils.time.sec2string(startSeconds + this.model.cutoff, 'am/pm')
    }
  },
  watch: {
    'model.public': function (v) {
      if (!v) { this.model.link = null }
    }
  },
  methods: {
    async show (id = null) {
      this.$status.processing = true
      this.trackLoaded = false
      this.newTrack = false
      this.showTips = false
      this.moment = null
      this.gpxFileInvalidMsg = ''
      if (id) {
        this.model = await api.getCourse(id, 'course')
        if (!this.model.source.alt) this.$set(this.model.source, 'alt', this.model.source.type)
        const tz = this.model.eventTimezone || moment.tz.guess()
        if (this.model.eventStart) {
          this.moment = moment(this.model.eventStart).tz(tz)
        } else {
          this.moment = moment(0).tz(tz)
        }
        this.updateDistanceUnit(this.model.override.distUnit)
        this.updateElevUnit(this.model.override.elevUnit)
        this.loopEnabled = this.model.loops > 1
      } else {
        this.moment = moment(0).tz(moment.tz.guess())
        this.model = JSON.parse(JSON.stringify(this.defaults))
        this.loopEnabled = false
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
    async reloadTrack () {
      const arr = await api.getCourseField(this.model._id, 'points')
      this.track = await this.$core.tracks.create(arr)
      this.trackLoaded = true
      return true
    },
    async save () {
      if (this.$status.processing) { return }
      this.$status.processing = true
      try {
        // if we have new track data, format and update:
        if (this.trackLoaded && this.track.length) {
          this.model.points = this.track.map(x => {
            return [
              this.$math.round(x.lat, 6),
              this.$math.round(x.lon, 6),
              this.$math.round(x.alt, 2)
            ]
          })
          this.model.distance = this.track.dist
          this.model.gain = this.track.gain
          this.model.loss = this.track.loss
        }

        this.model.eventTimezone = this.moment.tz()
        if (Number(this.moment.format('YYYY') > 1970)) {
          this.model.eventStart = this.moment.toDate()
        } else {
          this.model.race = false
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
            'distance',
            'gain',
            'loss',
            'override',
            'loops',
            'race',
            'cutoff'
          ]

          // only include new track info if we have a new course source:
          if (this.trackLoaded) {
            fields.push('source', 'points')
          }
          fields.forEach(f => {
            if (this.model[f] !== undefined) {
              updateModel[f] = this.model[f]
            }
          })
          await api.updateCourse(this.model._id, updateModel)
          this.$gtag.event('edit', { event_category: 'Course' })

          // update all waypoints to fit updated course:
          if (this.trackLoaded) {
            const course = new this.$core.courses.Course(this.model)
            course.addTrack(this.track)
            let waypoints = await api.getWaypoints(this.model._id)
            waypoints = waypoints.map(wp => { return new this.$core.waypoints.Waypoint(wp, course) })
            // if the course changed, map them to the new course LLA's
            this.$logger('CourseEdit|save: mapping waypoints to new course')
            waypoints.forEach(wp => {
              if (this.newTrack) {
                if (wp.type !== 'start' && wp.type !== 'finish') {
                // limit of 0.5 km or 5% of total:
                  const limit = Math.max(0.5, 0.05 * this.track.dist)
                  // resolve closest distance along course for waypoint LLA
                  wp.loc = this.track.getNearestLoc([wp.lat, wp.lon], wp.loc, limit)
                }
              }
              wp.refreshLLA(this.track)
            })

            // save them all
            await Promise.all(waypoints.map(async wp => {
              await api.updateWaypoint(wp.site._id, wp.site)
              this.$logger(`CourseEdit|save: updated waypoint ${wp.name}`)
            }))
          }
          this.$nextTick(async () => { await this.$core.util.sleep(100); this.$emit('afterEdit') })
        } else {
          const { id } = await api.createCourse(this.model)
          this.$gtag.event('create', { event_category: 'Course' })
          this.$nextTick(() => { this.$emit('afterCreate', { _id: id }) })
        }
        this.$status.processing = false
        this.clear()
        this.$refs.modal.hide()
      } catch (error) {
        this.$error.handle(error)
        this.$status.processing = false
      }
    },
    clear () {
      this.track = []
      this.model = JSON.parse(JSON.stringify(this.defaults))
      this.file = null
      this.trackLoaded = false
      this.newTrack = false
      this.gpxFileNoElevFlag = false
    },
    async remove () {
      this.$emit('delete', this.model, async (err) => {
        if (!err) {
          this.$gtag.event('delete', { event_category: 'Course' })
          this.$refs.modal.hide()
        }
      })
    },
    async loadFile (f) {
      this.file = f
      const t = this.$logger()
      this.$nextTick(async () => {
        const reader = new FileReader()
        reader.onload = e => {
          this.$logger('CourseEdit|GPX file read', t)
          const source = {
            type: 'gpx',
            name: this.gpxFile.name.split('.')[0],
            alt: 'gpx'
          }
          this.loadGPX(e.target.result, source)
        }
        if (f.target.files.length) {
          this.$status.processing = true
          this.gpxFileNoElevFlag = false
          reader.readAsText(f.target.files[0])
        }
      })
    },
    async loadGPX (f, source) {
      const logger = this.logger.child({ method: 'loadGPX' })
      try {
        gpxParse.parseGpx(f, async (error, data) => {
          try {
            if (error) {
              this.gpxFileInvalidMsg = `File format invalid: ${error.toString()}`
              this.$status.processing = false
              throw error
            } else {
              logger.info('GPX parsed')
              this.model.source = { ...source }

              // choose source from GPX:
              let arr = []
              if (data.tracks.length) {
                logger.info('Using GPX track')
                arr = data.tracks[0].segments[0]
              } else if (data.routes.length) {
                logger.info('Using GPX route')
                arr = data.routes[0].points
              } else {
                throw new Error('GPX file contains no tracks or routes')
              }

              // map to LLA array
              const llas = arr.map(p => {
                return [p.lat, p.lon, p.elevation]
              })

              if (llas.length < 100) {
                this.gpxFileInvalidMsg = 'GPX file has too few points.'
                this.$status.processing = false
                return
              }
              if (llas.length > 100000) {
                this.gpxFileInvalidMsg = 'File exceeds size limit of 100,000 points. If this is a valid file, contact me for help.'
                this.$status.processing = false
                return
              }
              const track = await this.$core.tracks.create(llas)
              const reduced = await track.reduceDensity()
              this.track = (reduced.length < track.length) ? reduced : track

              if (this.$config.requireGPXElevation && this.track.gain === 0) {
                this.gpxFileNoElevFlag = true
                logger.info('Getting elevation data')
                try {
                  await this.addElevationData(this.track)
                  logger.info(`Received elevation data for ${this.track.length} points`)
                } catch (error) {
                  this.gpxFileInvalidMsg = 'File does not contain elevation data and data is not available.'
                  logger.error(error.stack || error)
                  this.$status.processing = false
                  return
                }
              }
              this.gpxFileInvalidMsg = ''
              this.updateModelGainLoss()
              if (!this.model.name) {
                this.model.name = this.model.source.name
              }
              await this.defaultTimezone(this.track[0].lat, this.track[0].lon)
              this.trackLoaded = true
              this.newTrack = true
            }
          } catch (error) {
            logger.error(error.stack || error)
          }
          this.$status.processing = false
        })
      } catch (error) {
        logger.error(error.stack || error)
        this.$status.processing = false
      }
    },
    changeAltSource: async function (val) {
      this.$logger(`CourseEdit|changeAltSource to ${val}`)
      if (!this.track.length) await this.reloadTrack()
      if (this.track.length) {
        this.$set(this.model.source, 'alt', val)
        if (val === 'strava-route') {
          this.$refs.stravaRouteInput.getStravaRoute()
        } else if (val === 'gpx') {
          this.loadFile(this.file)
        } else {
          this.$status.processing = true
          const t2 = this.$logger('CourseEdit|changeAltSource getting elevation data')
          try {
            await this.addElevationData(this.track, val)
            this.$logger(`CourseEdit|changeAltSource received elevation data for ${this.track.length} points`, t2)
            this.track.calcStats()
            this.updateModelGainLoss()
          } catch (err) {
            this.gpxFileInvalidMsg = 'Elevation data and data is not available.'
            this.$logger('CourseEdit|changeAltSource failed to get elevation data.', t2)
            this.$gtag.exception({ description: err.message || err, fatal: false })
            this.$status.processing = false
            return
          }
          this.$status.processing = false
        }
        this.trackLoaded = true
      }
    },
    updateModelGainLoss: function () {
      if (!this.model.override?.enabled) {
        this.setDistGainLoss()
      }
    },
    setDistGainLoss: async function (val = false) {
      this.model.override.distUnit = this.$units.dist
      this.model.override.elevUnit = this.$units.alt
      if (!val) {
        delete this.model.override.dist
        delete this.model.override.gain
        delete this.model.override.loss
      } else {
        // if enabling override, initialize these values to match model
        this.model.override.dist = this.track?.dist || this.model.distance
        this.model.override.gain = this.track?.gain || this.model.gain
        this.model.override.loss = this.track?.loss || this.model.loss
        this.updateDistanceUnit(this.$units.dist)
        this.updateElevUnit(this.$units.alt)
      }
      this.$set(this.model.override, 'enabled', val)
    },
    updateDistance: function (val) {
      this.model.override.dist = val / ((this.model.override.distUnit === 'mi') ? 0.621371 : 1)
    },
    async updateDistanceUnit (val) {
      this.distf = this.$math.round(this.model.override.dist * ((val === 'mi') ? 0.621371 : 1), 2)
    },
    updateGain: function (val) {
      this.model.override.gain = val / ((this.model.override.elevUnit === 'ft') ? 3.28084 : 1)
    },
    updateLoss: function (val) {
      this.model.override.loss = -val / ((this.model.override.elevUnit === 'ft') ? 3.28084 : 1)
    },
    async updateElevUnit (val) {
      this.gainf = this.$math.round(this.model.override.gain * ((val === 'ft') ? 3.28084 : 1), 0)
      this.lossf = -this.$math.round(this.model.override.loss * ((val === 'ft') ? 3.28084 : 1), 0)
    },
    async defaultTimezone (lat, lon) {
      try {
        const tz = await this.$utils.timeout(
          api.getTimeZone(lat, lon),
          5000
        )
        if (Number(this.moment.format('YYYY') > 1970)) {
          this.moment = moment(this.moment.utc().tz(tz))
        } else {
          this.moment = moment(0).tz(tz)
        }
      } catch (error) {
        this.$error.handle(error)
      }
    },
    showHelp () {
      this.$refs.help.show()
    },
    toggleTips () {
      this.showTips = !this.showTips
    },
    sourceChange (val) {
      this.gpxFile = null
      this.track = []
      this.trackLoaded = false
      delete this.model.source.name
      this.model.source.alt = val
    },
    async addElevationData (track, source) {
      const lls = track.map(p => {
        return [
          this.$math.round(p.lat, 6),
          this.$math.round(p.lon, 6)
        ]
      })
      const data = await this.$utils.timeout(
        this.$api.getElevation(lls, source),
        15000 + lls.length
      )
      if (lls.length === data.alts.length) {
        track.forEach((p, i) => {
          p.alt = data.alts[i]
        })
        track.calcStats()
        this.$set(this.model.source, 'alt', data.source)
        this.$gtag.event('addElevationData', { event_category: 'Course', event_label: data.source })
      } else {
        throw new Error('Elevation data returned does not match.')
      }
    },
    toggleLoop (val) {
      this.model.loops = val ? 2 : 1
    },
    toggleRace (val) {
      if (!val) {
        this.model.cutoff = null
        this.moment = moment(0).tz(this.moment.tz())
      }
    }
  }
}
</script>
