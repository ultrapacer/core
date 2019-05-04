<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">{{ course.name }}</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>

        <div role="tablist">
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block href="#" v-b-toggle.accordion-1 variant="info">Splits</b-button>
            </b-card-header>
            <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Split [{{ user.distUnits }}]</th>
                      <th>Gain [{{ user.elevUnits }}]</th>
                      <th>Loss [{{ user.elevUnits }}]</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(split, index) in splits" :key="index">
                      <td>{{ split.end | formatDist(distScale) }}</td>
                      <td>{{ split.gain | formatAlt(altScale) }}</td>
                      <td>{{ split.loss | formatAlt(altScale) }}</td>
                    </tr>
                  </tbody>
                  <thead>
                    <tr>
                      <th>&nbsp;</th>
                      <th>{{ course.gain | formatAlt(altScale) }}</th>
                      <th>{{ course.loss | formatAlt(altScale) }}</th>
                    </tr>
                  </thead>
                </table>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block href="#" v-b-toggle.accordion-3 variant="info">Waypoints</b-button>
            </b-card-header>
            <b-collapse id="accordion-3" accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location [{{ user.distUnits }}]</th>
                      <th>Elevation [{{ user.elevUnits }}]</th>
                      <th>&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="waypoint in waypoints" :key="waypoint._id">
                      <td>{{ waypoint.name }}</td>
                      <td>{{ waypoint.location | formatDist(distScale) }}</td>
                      <td>{{ waypoint.elevation | formatAlt(altScale) }}</td>
                      <td class="text-right">
                        <a href="#" @click.prevent="populateWaypointToEdit(waypoint)">Edit</a>
                        <span v-show="waypoint.type != 'start' && waypoint.type != 'finish'">/
                          <a href="#" @click.prevent="deleteWaypoint(waypoint._id)">Delete</a>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-show="!editingWaypoint">
                  <b-btn variant="success" @click.prevent="newWaypoint()">New Waypoint</b-btn>
                </div>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block href="#" v-b-toggle.accordion-4 variant="info">Segments</b-button>
            </b-card-header>
            <b-collapse id="accordion-4" accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Start</th>
                      <th>End</th>
                      <th>Distance</th>
                      <th>Gain [{{ user.elevUnits }}]</th>
                      <th>Loss [{{ user.elevUnits }}]</th>
                      <th>Terrain</th>
                      <th>&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="segment in segments" :key="segment.start._id">
                      <td>{{ segment.start.name }}</td>
                      <td>{{ segment.end.name }}</td>
                      <td>{{ segment.len | formatDist(distScale) }}</td>
                      <td>{{ segment.gain | formatAlt(altScale) }}</td>
                      <td>{{ segment.loss | formatAlt(altScale) }}</td>
                      <td>{{ segment.start.terrainIndex }}</td>
                      <td class="text-right">
                        <a href="#" @click.prevent="populateSegmentToEdit(segment.start)">Edit</a>
                      </td>
                    </tr>
                  </tbody>
                  <thead>
                    <tr>
                      <th>&nbsp;</th>
                      <th>&nbsp;</th>
                      <th>{{ course.distance | formatDist(distScale) }}</th>
                      <th>{{ course.gain | formatAlt(altScale) }}</th>
                      <th>{{ course.loss | formatAlt(altScale) }}</th>
                      <th>&nbsp;</th>
                      <th>&nbsp;</th>
                    </tr>
                  </thead>
                </table>
              </b-card-body>
            </b-collapse>
          </b-card>
        </div>
      </b-col>
      <b-col lg="5">
        <b-card v-show="showMap" >
          <CourseChart :points="points" :user="user" />
        </b-card>
        <b-card v-show="editingWaypoint" :title="(waypoint._id ? 'Edit Waypoint' : 'New Waypoint')">
          <form @submit.prevent="saveWaypoint">
            <b-form-group label="Name">
              <b-form-input type="text" v-model="waypoint.name"></b-form-input>
            </b-form-group>
            <b-form-group v-bind:label="'Location [' + user.distUnits + ']'" v-show="waypoint.type != 'start' && waypoint.type != 'finish'">
              <b-form-input type="number" step="0.001" v-model="waypointLoc" min="0" v-bind:max="course.distance"></b-form-input>
            </b-form-group>
            <b-form-group label="Type">
              <b-form-select type="number" v-model="waypoint.type" :options="waypointTypes"></b-form-select>
            </b-form-group>
            <b-form-group label="Description">
              <b-form-textarea rows="4" v-model="waypoint.description"></b-form-textarea>
            </b-form-group>
            <div>
              <b-btn type="submit" variant="success">Save Waypoint</b-btn>
              <b-btn type="cancel" @click.prevent="cancelWaypointEdit()">Cancel</b-btn>
            </div>
          </form>
        </b-card>
        <b-card v-show="editingSegment" :title="'Segment starting at ' + waypoint.name">
          <form @submit.prevent="saveSegment">
            <b-form-group label="Terrain">
              <b-form-input type="number" v-model="waypoint.terrainIndex" min="0" step="0"></b-form-input>
            </b-form-group>
            <b-form-group label="Notes">
              <b-form-textarea rows="4" v-model="waypoint.segmentNotes"></b-form-textarea>
            </b-form-group>
            <div>
              <b-btn type="submit" variant="success">Save Segment</b-btn>
              <b-btn type="cancel" @click.prevent="cancelSegmentEdit()">Cancel</b-btn>
            </div>
          </form>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import CourseChart from './CourseChart'
import api from '@/api'
import utilities from '../../shared/utilities'
export default {
  props: ['user'],
  components: {
    CourseChart
  },
  data () {
    return {
      loading: false,
      course: {},
      splits: [],
      unitSystem: 'english',
      waypoint: {},
      waypoints: [],
      editingWaypoint: false,
      editingSegment: false,
      points: []
    }
  },
  computed: {
    segments: function () {
      if (!this.points.length) { return [] }
      if (!this.waypoints.length) { return [] }
      var arr = []
      var breaks = []
      for (var i = 0, il = this.waypoints.length; i < il; i++) {
        breaks.push(this.waypoints[i].location)
      }
      var splits = utilities.calcSegments(this.points, breaks)
      for (var j = 0, jl = splits.length; j < jl; j++) {
        arr.push({
          start: this.waypoints[j],
          end: this.waypoints[j + 1],
          len: splits[j].len,
          gain: splits[j].gain,
          loss: splits[j].loss
        })
      }
      return arr
    },
    waypointTypes: function () {
      if (this.waypoint.type === 'start') {
        return [{ value: 'start', text: 'Start' }]
      } else if (this.waypoint.type === 'finish') {
        return [{ value: 'finish', text: 'Finish' }]
      } else {
        return [
          { value: 'aid', text: 'Aid Station' },
          { value: 'landmark', text: 'Landmark' }
        ]
      }
    },
    showMap: function () {
      if (!this.editingSegment && !this.editingWaypoint) {
        return true
      } else {
        return false
      }
    },
    distScale: function () {
      if (this.user.distUnits === 'mi') {
        return 0.621371
      } else {
        return 1
      }
    },
    altScale: function () {
      if (this.user.elevUnits === 'ft') {
        return 3.28084
      } else {
        return 1
      }
    },
    waypointLoc: {
      set: function (val) {
        this.waypoint.location = val / this.distScale
      },
      get: function () {
        return (this.waypoint.location * this.distScale).toFixed(3)
      }
    }
  },
  watch: {
    editingSegment: function (val) {
      if (val) { this.editingWaypoint = false }
    },
    editingWaypoint: function (val) {
      if (val) { this.editingSegment = false }
    }
  },
  filters: {
    formatDist (val, distScale) {
      return (val * distScale).toFixed(2)
    },
    formatAlt (val, altScale) {
      return (val * altScale).toFixed(0)
    }
  },
  async created () {
    this.loading = true
    this.course = await api.getCourse(this.$route.query.course)
    this.points = utilities.addLoc(this.course._gpx.points)
    this.waypoints = this.course.waypoints
    await this.checkWaypoints()
    this.splits = utilities.calcSplits(this.points, this.user.distUnits)
    this.loading = false
  },
  methods: {
    async newWaypoint () {
      this.waypoint = {}
      this.editingWaypoint = true
    },
    async cancelWaypointEdit () {
      this.waypoint = {}
      this.editingWaypoint = false
    },
    async cancelSegmentEdit () {
      this.waypoint = {}
      this.editingSegment = false
    },
    async saveWaypoint () {
      this.waypoint.elevation = utilities.getElevation(this.points, this.waypoint.location)
      if (this.waypoint._id) {
        await api.updateWaypoint(this.waypoint._id, this.waypoint)
      } else {
        this.waypoint._course = this.course._id
        await api.createWaypoint(this.waypoint)
      }
      this.waypoint = {} // reset form
      await this.refreshWaypoints()
      this.editingWaypoint = false
    },
    async saveSegment () {
      await api.updateSegment(this.waypoint._id, this.waypoint)
      this.waypoint = {} // reset form
      await this.refreshWaypoints()
      this.editingSegment = false
    },
    async refreshWaypoints () {
      this.waypoints = await api.getWaypoints(this.$route.query.course)
      if (!this.waypoints.length) {
        await api.createWaypoint({
          name: 'Start',
          location: 0,
          _course: this.course._id,
          elevation: this.points[this.points.length - 1].alt
        })
        await this.refreshWaypoints()
      }
    },
    async deleteWaypoint (id) {
      if (confirm('Are you sure you want to delete this waypoint?')) {
        // if we are editing a waypoint we deleted, remove it from the form
        if (this.waypoint._id === id) {
          this.waypoint = {}
          this.editingWaypoint = false
        }
        this.loading = true
        await api.deleteWaypoint(id)
        await this.refreshWaypoints()
        this.loading = false
      }
    },
    async populateWaypointToEdit (waypoint) {
      this.waypoint = Object.assign({}, waypoint)
      this.editingWaypoint = true
    },
    async populateSegmentToEdit (waypoint) {
      this.waypoint = Object.assign({}, waypoint)
      this.editingSegment = true
    },
    async checkWaypoints () {
      var update = false
      if (!this.waypoints.find(waypoint => waypoint.type === 'start')) {
        await api.createWaypoint({
          name: 'Start',
          type: 'start',
          location: 0,
          _course:
          this.course._id,
          elevation: this.points[this.points.length - 1].alt
        })
        update = true
      }
      if (!this.waypoints.find(waypoint => waypoint.type === 'finish')) {
        await api.createWaypoint({
          name: 'Finish',
          type: 'finish',
          location: this.course.distance,
          _course: this.course._id,
          elevation: this.points[this.points.length - 1].alt
        })
        update = true
      }
      if (update) {
        await this.refreshWaypoints()
      }
    }
  }
}
</script>
