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
const gpxParse = require('gpx-parse')
export default {
  data () {
    return {
      defaults: {eventTimezone: moment.tz.guess()},
      gpxFile: null,
      gpxPoints: [],
      model: {},
      saving: false,
      deleting: false,
      eventDate: null,
      eventTime: null,
      timezones: moment.tz.names()
    }
  },
  methods: {
    async show (course) {
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
    async save () {
      if (this.saving) { return }
      this.saving = true
      if (this.gpxPoints.length) {
        this.model.source = {
          type: 'gpx',
          name: this.gpxFile.name
        }
        let points = this.gpxPoints
        geo.addLoc(points)
        var stats = geo.calcStats(points)
        this.model.gain = stats.gain
        this.model.loss = stats.loss

        if (this.model._id) {
          // update all waypoints to fit updated course:
          let waypoints = await api.getWaypoints(this.model._id)
          if (waypoints.length) {
            await Promise.all(waypoints.map(async wp => {
              let t = this.$logger()
              var wpold = wp.location
              // scale waypoint location for new course distance:
              if (wp.type === 'finish') {
                wp.location = stats.dist
              } else {
                wp.location = wp.location * stats.dist / this.model.distance
              }
              if (wp.type !== 'start' && wp.type !== 'finish') {
                try {
                  var wpdelta = Math.abs(wpold - wp.location)
                  // iteration threshold th:
                  var th = Math.max(0.5, Math.min(wpdelta, this.model.distance))
                  // resolve closest distance for waypoint LLA
                  wp.location = wputil.nearestLoc(wp, points, th)
                } catch (err) {
                  console.log(err)
                }
              }
              wputil.updateLLA(wp, points)
              await api.updateWaypoint(wp._id, wp)
              this.$logger(`CourseEdit|save|adjustWaypoint: ${wp.name}`, t)
            }))
          }
        }
        this.model.distance = stats.dist
        
        // get reduced point set:
        let pmax = round(Math.min(10000, points[points.length - 1].loc / 0.025), 0)
        if (points.length > pmax) {
          let len = points[points.length - 1].loc
          let xs = Array(pmax).fill(0).map((e, i) => i++ * len / (pmax - 1))
          let adj = geo.pointWLSQ(
            points,
            xs,
            0.05
          )
          let reduced = []
          let llas = geo.getLatLonAltFromDistance(points, xs, 0)
          xs.forEach((x, i) => {
            reduced.push({
              alt: adj[i].alt,
              lat: llas[i].lat,
              lon: llas[i].lon,
              loc: x,
              grade: adj[i].grade,
              dloc: (i === 0) ? 0 : xs[i] - xs[i - 1]
            })
          })
          //reformat points for upload
          this.model.points = reduced.map(x => {
            return [x.lat, x.lon, x.alt]
          })
          this.model.raw = points.map(x => {
            return [x.lat, x.lon, x.alt]
          })
        } else {
          //reformat points for upload
          this.model.points = points.map(x => {
            return [x.lat, x.lon, x.alt]
          })
        }
      }
      
      if (this.eventTime && this.eventDate) {
        this.model.eventStart = moment.tz(`${this.eventDate} ${this.eventTime}`, this.model.eventTimezone).toDate()
      } else {
        this.model.eventStart = null
      }

      if (this.model._id) {
        await api.updateCourse(this.model._id, this.model)
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
      this.$emit('delete', this.course, async (err) => {
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
            this.gpxPoints = geo.cleanPoints(data.tracks[0].segments[0])
          }
        })
      }
      reader.readAsText(f.target.files[0])
    }
  }
}
</script>
