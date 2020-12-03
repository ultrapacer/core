<template>
  <div>
    <b-modal
      id="course-edit-modal"
      centered
      v-bind:title="(model._id ? 'Edit' : 'New') + ' Course'"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <form ref="courseform" @submit.prevent="">
        <b-input-group
          prepend="Name"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Name: name for the course, for example \'\'Western States 100\'\''
          "
        >
        <b-form-input type="text" v-model="model.name" required>
        </b-form-input>
        </b-input-group>
        <b-input-group prepend="Description"
          class="mb-2"
          size="sm"
        >
          <b-form-textarea rows="2" v-model="model.description">
          </b-form-textarea>
        </b-input-group>
        <b-input-group
          prepend="File"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'File: GPX format file exported from a GPS track or route builder.'
          "
        >
          <b-form-file
            size="sm"
            v-model="gpxFile"
            :placeholder="(model.source) ? model.source.name : 'Choose a GPX file...'"
            accept=".gpx"
            @change="loadGPX"
            no-drop
            :required="!Boolean(model.source)"
          ></b-form-file>
        </b-input-group>
        <b-input-group
          prepend="Event Date"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Date [optional]: use for races, etc.'
          "
        >
          <b-form-input
            type="date"
            v-model="eventDate"
            :required="Boolean(eventDate)"
          >
          </b-form-input>
        </b-input-group>
        <b-input-group
          prepend="Start Time"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Start Time [optional]: time of day event begins'
          "
        >
          <b-form-input
            type="time"
            v-model="eventTime"
            :required="Boolean(eventDate)"
          >
          </b-form-input>
        </b-input-group>
        <b-input-group
          prepend="Timezone"
          class="mb-2"
          size="sm"
        >
          <b-form-select
            :options="timezones"
            v-model="model.eventTimezone"
            :required="Boolean(eventTime)"
          >
          </b-form-select>
        </b-input-group>

        <div v-if="courseLoaded">
          <b-form-checkbox
            v-model="model.override.enabled"
            size="sm"
            class="mb-2"
            :unchecked-value="false"
            @change="setDistGainLoss"
          >
            Override distance/gain/loss from GPX file
          </b-form-checkbox>

          <b-form-group
            class="mb-0 pl-3"
            v-if="model.override.enabled"
          >
            <b-input-group
              prepend="Distance"
              class="mb-2"
              size="sm"
            >
              <b-form-input
                type="number"
                v-model="distancef"
                required
                step="0.01"
                @change="updateDistance"
                :min="round(stats.dist * ((model.override.distUnit === 'mi') ? 0.621371 : 1) * 0.9, 2)"
                :max="round(stats.dist * ((model.override.distUnit === 'mi') ? 0.621371 : 1) * 1.1, 2)"
              >
              </b-form-input>
              <b-form-select
                :options="distUnits"
                v-model="model.override.distUnit"
                required
                @change="updateDistanceUnit"
                >
              </b-form-select>
            </b-input-group>
            <b-input-group
              prepend="Elevation Gain"
              class="mb-2"
              size="sm"
            >
              <b-form-input
                type="number"
                v-model="gainf"
                required
                step="0"
                :min="round(stats.gain * ((model.override.elevUnit === 'ft') ? 3.28084 : 1) * 0.8, 0)"
                :max="round(stats.gain * ((model.override.elevUnit === 'ft') ? 3.28084 : 1) * 1.2, 0)"
                @change="updateGain"
              >
              </b-form-input>
              <b-form-select
                :options="elevUnits"
                v-model="model.override.elevUnit"
                required
                @change="updateElevUnit"
                >
              </b-form-select>
            </b-input-group>
            <b-input-group
              prepend="Elevation Loss"
              class="mb-2"
              size="sm"
            >
              <b-form-input
                type="number"
                v-model="lossf"
                required
                step="0"
                :min="round(-stats.loss * ((model.override.elevUnit === 'ft') ? 3.28084 : 1) * 0.8, 0)"
                :max="round(-stats.loss * ((model.override.elevUnit === 'ft') ? 3.28084 : 1) * 1.2, 0)"
                @change="updateLoss"
              >
              </b-form-input>
              <b-form-select
                :options="elevUnits"
                v-model="model.override.elevUnit"
                required
                @change="updateElevUnit"
                >
              </b-form-select>
            </b-input-group>
          </b-form-group>
        </div>

        <b-form-checkbox
          v-model="model.public"
          :value="true"
            size="sm"
            class="mb-2"
          :unchecked-value="false"
          v-b-popover.hover.bottomright.d250.v-info="
            'Visibility: if public, anybody with the link can view and make plans for the course.'
          "
        >
          Visible to public
        </b-form-checkbox>
        <b-input-group
          v-if="model.public && user.admin"
          prepend="Permalink"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Permalink: readable link for official races; https://ultrapacer.com/race/(permalink)'
          "
        >
        <b-form-input type="text" v-model="model.link">
        </b-form-input>
        </b-input-group>
      </form>
      <template slot="modal-footer" slot-scope="{ ok, cancel }">
        <div v-if="model._id" style="text-align: left; flex: auto">
          <b-button size="sm" variant="danger" @click="remove">
            <b-spinner v-show="deleting" small></b-spinner>
            Delete
          </b-button>
        </div>
        <b-button variant="secondary" @click="cancel()">
          Cancel
        </b-button>
        <b-button variant="primary" @click="ok()">
          <b-spinner v-show="saving" small></b-spinner>
          Save Course
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'
import geo from '@/util/geo'
import moment from 'moment-timezone'
import wputil from '@/util/waypoints'
import { round } from '@/util/math'
const gpxParse = require('gpx-parse')
export default {
  props: ['user'],
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
      gpxPoints: [],
      model: {},
      saving: false,
      deleting: false,
      eventDate: null,
      eventTime: null,
      stats: null,
      timezones: moment.tz.names(),
      distancef: null,
      gainf: null,
      lossf: null
    }
  },
  computed: {
    units: function () {
      var u = {
        dist: (this.isAuthenticated) ? this.user.distUnits : 'mi',
        alt: (this.isAuthenticated) ? this.user.elevUnits : 'ft'
      }
      u.distScale = (u.dist === 'mi') ? 0.621371 : 1
      u.altScale = (u.alt === 'ft') ? 3.28084 : 1
      return u
    }
  },
  methods: {
    async show (course, raw = null) {
      if (course._id) {
        this.model = Object.assign({}, course)
        if (!this.model.eventTimezone) { this.model.eventTimezone = moment.tz.guess() }
        if (this.model.eventStart) {
          let m = moment(this.model.eventStart).tz(this.model.eventTimezone)
          this.eventDate = m.format('YYYY-MM-DD')
          this.eventTime = m.format('kk:mm')
        } else {
          this.eventDate = null
          this.eventTime = null
        }
        this.model.override = {...course.override}
        this.$calculating.setCalculating(true)
        await this.reloadRaw()
        this.$calculating.setCalculating(false)
      } else {
        this.model = Object.assign({}, this.defaults)
      }
      this.$bvModal.show('course-edit-modal')
    },
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      if (this.$refs.courseform.reportValidity()) {
        this.save()
      }
    },
    async reloadRaw () {
      let raw = await api.getCourseField(this.model._id, 'raw')
      this.gpxPoints = raw.map(p => {
        return { lat: p[0], lon: p[1], alt: p[2] }
      })
      geo.addLoc(this.gpxPoints)
      this.stats = geo.calcStats(this.gpxPoints, true)
      this.updateDistanceUnit(this.model.override.distUnit)
      this.updateElevUnit(this.model.override.elevUnit)
      this.courseLoaded = true
    },
    async save () {
      if (this.saving) { return }
      this.saving = true
      if (this.gpxPoints.length) {
        let points = this.gpxPoints

        let reduced = geo.reduce(points, this.model.distance)
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
          let waypoints = await api.getWaypoints(this.model._id)
          let finish = waypoints.find(wp => wp.type === 'finish')
          let olddist = finish.location
          if (round(finish.location, 4) !== round(this.model.distance, 4)) {
            console.log('Scaling waypoints')
            await Promise.all(waypoints.map(async wp => {
              let t = this.$logger()
              var wpold = wp.location
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
                    var wpdelta = Math.abs(wpold - wp.location)
                    // iteration threshold th:
                    var th = Math.max(0.5, Math.min(wpdelta, this.model.distance))
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

      if (this.eventTime && this.eventDate) {
        this.model.eventStart = moment.tz(
          `${this.eventDate} ${this.eventTime}`,
          this.model.eventTimezone).toDate()
      } else {
        this.model.eventStart = null
      }

      if (this.model._id) {
        let updateModel = {}
        let fields = [
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
          if (this.model.hasOwnProperty(f)) {
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
        this.saving = false
        this.clear()
        this.$bvModal.hide('course-edit-modal')
      })
    },
    clear () {
      this.model = Object.assign({}, this.defaults)
    },
    async remove () {
      this.deleting = true
      this.$emit('delete', this.model, async (err) => {
        if (!err) {
          this.$ga.event('Course', 'delete')
          this.$bvModal.hide('course-edit-modal')
        }
        this.deleting = false
      })
    },
    async loadGPX (f) {
      const reader = new FileReader()
      reader.onload = e => {
        gpxParse.parseGpx(e.target.result, (error, data) => {
          if (error) {
            throw error
          } else {
            this.gpxPoints = data.tracks[0].segments[0].map(p => {
              return {
                alt: p.elevation,
                lat: p.lat,
                lon: p.lon
              }
            })
            geo.addLoc(this.gpxPoints)
            this.stats = geo.calcStats(this.gpxPoints, true)
            this.model.gain = this.stats.gain
            this.model.loss = this.stats.loss
            this.model.distance = this.stats.dist
            this.setDistGainLoss()

            this.model.source = {
              type: 'gpx',
              name: this.gpxFile.name
            }

            this.courseLoaded = true
          }
        })
      }
      reader.readAsText(f.target.files[0])
    },
    setDistGainLoss: async function (val = false) {
      this.model.override.distUnit = this.user.distUnits
      this.model.override.elevUnit = this.user.elevUnits
      if (!val) {
        this.model.gain = this.stats.gain
        this.model.loss = this.stats.loss
        this.model.distance = this.stats.dist
        this.updateDistanceUnit(this.model.override.distUnit)
        this.updateElevUnit(this.model.override.elevUnit)
      } else {
        this.updateDistanceUnit(this.user.distUnits)
        this.updateElevUnit(this.user.elevUnits)
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
    round: function (val, dec) {
      return round(val, dec)
    }
  }
}
</script>
