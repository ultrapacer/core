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
        <b-form-group label="Privacy">
          <b-form-checkbox
            v-model="model.public"
            value="true"
            unchecked-value="false">
            Visible to public
          </b-form-checkbox>
        </b-form-group>
        <b-form-group v-if="!showTrackForms && model.source" label="Source">
          {{ sources[course.source.type] }}: {{ course.source.name }}
          (<b-link @click="changeTrack">change</b-link>)
        </b-form-group>
        <div v-if="showTrackForms && model.source">
          <b-form-group label="Source">
            <b-form-radio v-model="model.source.type" value="gpx">
              GPX file
            </b-form-radio>
            <b-form-radio
              v-model="model.source.type"
              value="stravaRoute"
              disabled>
              Strava Route
            </b-form-radio>
            <b-form-radio
              v-model="model.source.type"
              value="stravaActivity"
              disabled>
              Strava Activity
            </b-form-radio>
          </b-form-group>
          <b-form-group v-if="model.source.type==='gpx'">
            <b-form-file
                :state="Boolean(gpxFile)"
                v-model="gpxFile"
                placeholder="Choose a GPX file..."
                drop-placeholder="Drop GPX file here..."
                accept=".gpx"
                @change="loadGPX"
                required
              ></b-form-file>
          </b-form-group>
          <b-form-group v-if="model.source.type==='stravaRoute'">
            <p class="lead">Strava integration coming soon...</p>
          </b-form-group>
          <b-form-group v-if="model.source.type==='stravaActivity'">
            <p class="lead">Strava integration coming soon...</p>
          </b-form-group>
        </div>
        <b-form-group label="Description">
          <b-form-textarea rows="4" v-model="model.description">
          </b-form-textarea>
        </b-form-group>
        <h5>Event-specific information:</h5>
        <b-input-group
          prepend="Event Date"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Date: use for races, etc.'
          "
        >
          <b-form-input
            type="date"
            v-model="model.eventDate"
            >
          </b-form-input>
        </b-input-group>
        
        <b-input-group
          prepend="Start Time"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Start Time: time of day event begins'
          "
        >
          <b-form-input
            type="time"
            v-model="model.eventTime"
            >
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
import wputil from '@/util/waypoints'
const gpxParse = require('gpx-parse')
export default {
  props: ['course'],
  data () {
    return {
      defaults: { source: { type: 'gpx' } },
      gpxFile: null,
      gpxPoints: [],
      model: {},
      saving: false,
      deleting: false,
      showTrackForms: true,
      sources: {
        gpx: 'GPX File',
        stravaActivity: 'Strava Activity',
        stravaRoute: 'Strava Route'
      }
    }
  },
  watch: {
    course: function (val) {
      if (val._id) {
        this.model = Object.assign({}, val)
        if (this.model.points) {
          delete this.model.points
        }
        this.showTrackForms = false
      } else {
        this.model = Object.assign({}, this.defaults)
        this.showTrackForms = true
      }
      this.$bvModal.show('course-edit-modal')
    }
  },
  methods: {
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      if (this.$refs.courseform.reportValidity()) {
        this.save()
      }
    },
    async save () {
      if (this.saving) { return }
      this.saving = true
      if (this.model.source.type === 'gpx' && this.gpxPoints.length) {
        this.model.source.name = this.gpxFile.name
        this.model.points = this.gpxPoints
        let p2 = []
        this.model.points.forEach((x) => { p2.push({...x}) })
        geo.addLoc(p2)
        var stats = geo.calcStats(p2)
        this.model.distance = p2[p2.length - 1].loc
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
                wp.location = this.model.distance
              } else {
                wp.location = wp.location * this.model.distance / this.course.distance
              }
              if (wp.type !== 'start' && wp.type !== 'finish') {
                try {
                  var wpdelta = Math.abs(wpold - wp.location)
                  // iteration threshold th:
                  var th = Math.max(0.5, Math.min(wpdelta, this.model.distance))
                  // resolve closest distance for waypoint LLA
                  wp.location = wputil.nearestLoc(wp, p2, th)
                } catch (err) {
                  console.log(err)
                }
              }
              wputil.updateLLA(wp, p2)
              await api.updateWaypoint(wp._id, wp)
              this.$logger(`CourseEdit|save|adjustWaypoint: ${wp.name}`, t)
            }))
          }
        }
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
      this.showTrackForms = true
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
    async changeTrack () {
      this.showTrackForms = true
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
