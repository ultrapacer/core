<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">{{ course.name }}</h1>
    <b-card v-show="initializing" class="mt-3">
      <b-spinner label="Loading..."></b-spinner>
    </b-card>
    <b-row v-if="!initializing">
      <b-col order="2">
        <b-tabs content-class="mt-3">
          <b-tab title="Splits" active>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Split [{{ distUnits }}]</th>
                  <th>Gain [{{ elevUnits }}]</th>
                  <th>Loss [{{ elevUnits }}]</th>
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
          </b-tab>
          <b-tab title="Waypoints">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location [{{ distUnits }}]</th>
                  <th>Elevation [{{ elevUnits }}]</th>
                  <th>&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="waypoint in waypoints" :key="waypoint._id">
                  <td>{{ waypoint.name }}</td>
                  <td>{{ waypoint.location | formatDist(distScale) }}</td>
                  <td>{{ waypoint.elevation | formatAlt(altScale) }}</td>
                  <td class="text-right" v-if="owner">
                    <a href="#" @click.prevent="populateWaypointToEdit(waypoint)">Edit</a>
                    <span v-show="waypoint.type != 'start' && waypoint.type != 'finish'">/
                      <a href="#" @click.prevent="deleteWaypoint(waypoint._id)">Delete</a>
                    </span>
                  </td>
                  <th v-if="!owner">&nbsp;</th>
                </tr>
              </tbody>
            </table>
            <div v-show="!editingWaypoint" v-if="owner">
              <b-btn variant="success" @click.prevent="newWaypoint()">New Waypoint</b-btn>
            </div>
          </b-tab>
          <b-tab title="Segments">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Start</th>
                  <th>End</th>
                  <th>Distance</th>
                  <th>Gain [{{ elevUnits }}]</th>
                  <th>Loss [{{ elevUnits }}]</th>
                  <th>Grade</th>
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
                  <td>{{ segment.grade }}%</td>
                  <td>{{ segment.start.terrainIndex }}</td>
                  <td class="text-right">
                    <a v-if="owner" href="#" @click.prevent="populateSegmentToEdit(segment.start)">Edit</a>
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
          </b-tab>
        </b-tabs>
      </b-col>
      <b-col lg="5" order="1">
        <b-card v-if="!initializing" v-show="showMap" class="sticky-top mt-3">
          <line-chart :chart-data="chartData" :options="chartOptions"></line-chart>
        </b-card>
        <b-card v-show="editingWaypoint" :title="(waypoint._id ? 'Edit Waypoint' : 'New Waypoint')">
          <form @submit.prevent="saveWaypoint">
            <b-form-group label="Name">
              <b-form-input type="text" v-model="waypoint.name"></b-form-input>
            </b-form-group>
            <b-form-group v-bind:label="'Location [' + distUnits + ']'" v-show="waypoint.type != 'start' && waypoint.type != 'finish'">
              <b-form-input type="number" step="0.001" v-model="waypointLoc" min="0" v-bind:max="course.distance"></b-form-input>
            </b-form-group>
            <b-form-group label="Type">
              <b-form-select type="number" v-model="waypoint.type" :options="waypointTypes"></b-form-select>
            </b-form-group>
            <b-form-group label="Description">
              <b-form-textarea rows="4" v-model="waypoint.description"></b-form-textarea>
            </b-form-group>
            <div>
              <b-btn type="submit" variant="success" :disabled="saving">
                 <b-spinner v-show="saving" small></b-spinner>
                Save Waypoint
              </b-btn>
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
              <b-btn type="submit" variant="success" :disabled="saving">
                 <b-spinner v-show="saving" small></b-spinner>
                 Save Segment
               </b-btn>
              <b-btn type="cancel" @click.prevent="cancelSegmentEdit()">Cancel</b-btn>
            </div>
          </form>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import LineChart from './LineChart.js'
import api from '@/api'
import utilities from '../../shared/utilities'
export default {
  title: 'Loading',
  props: ['isAuthenticated', 'user'],
  components: {
    LineChart
  },
  data () {
    return {
      initializing: true,
      saving: false,
      course: {},
      splits: [],
      unitSystem: 'english',
      waypoint: {},
      waypoints: [],
      editingWaypoint: false,
      editingSegment: false,
      points: [],
      chartColors: {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        darkgreen: 'rgb(50, 150, 150)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
      },
      chartProfile: [],
      chartOptions: {
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'bottom',
            ticks: {
              stepSize: 5,
              callback: function (value, index, values) {
                if (value % 5 === 0) {
                  return value
                } else {
                  return ''
                }
              }
            }
          }]
        },
        tooltips: {
          enabled: true,
          filter: function (tooltipItem) {
            return tooltipItem.datasetIndex === 0
          }
        },
        legend: {
          display: false
        }
      }
    }
  },
  computed: {
    owner: function () {
      if (this.isAuthenticated && String(this.user._id) === String(this.course._user)) {
        return true
      } else {
        return false
      }
    },
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
          loss: splits[j].loss,
          grade: splits[j].grade
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
    distUnits: function () {
      return (this.isAuthenticated) ? this.user.distUnits : 'mi'
    },
    elevUnits: function () {
      return (this.isAuthenticated) ? this.user.elevUnits : 'ft'
    },
    distScale: function () {
      if (this.distUnits === 'mi') {
        return 0.621371
      } else {
        return 1
      }
    },
    altScale: function () {
      if (this.elevUnits === 'ft') {
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
    },
    chartData: function () {
      return {
        datasets: [
          this.chartPoints,
          { data: this.chartProfile,
            pointRadius: 0,
            pointHoverRadius: 0,
            backgroundColor: this.transparentize(this.chartColors.blue)
          }
        ]
      }
    },
    chartPoints: function () {
      if (!this.waypoints.length) { return [] }
      var d = {
        data: [],
        backgroundColor: [],
        borderColor: [],
        fill: false,
        pointRadius: [],
        pointStyle: [],
        pointHoverRadius: 10,
        showLine: false
      }
      console.log(':::: getting chartPoints :::::::')
      d.data = []
      for (var i = 0, il = this.waypoints.length; i < il; i++) {
        d.data.push({
          x: this.waypoints[i].location * this.distScale,
          y: this.waypoints[i].elevation * this.altScale
        })
        if (this.waypoints[i].type === 'landmark') {
          d.pointRadius.push(6)
          d.pointStyle.push('triangle')
          d.backgroundColor.push(this.chartColors.darkgreen)
          d.borderColor.push(this.chartColors.darkgreen)
        } else {
          d.pointRadius.push(6)
          d.pointStyle.push('circle')
          d.backgroundColor.push(this.chartColors.red)
          d.borderColor.push(this.chartColors.red)
        }
      }
      console.log(':::: done getting chartPoints :::::::')
      return d
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
    this.course = await api.getCourse(this.$route.params.course)
    this.$title = this.course.name
    this.points = utilities.addLoc(this.course._gpx.points)
    this.waypoints = await api.getWaypoints(this.course._id)
    this.updateChartProfile()
    this.splits = utilities.calcSplits(this.points, this.distUnits)
    this.initializing = false
    console.log('::::: CREATED :::::::')
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
      this.saving = true
      if (this.waypoint.type === 'start') {
        this.waypoint.elevation = this.points[0].alt
      } else if (this.waypoint.type === 'finish') {
        this.waypoint.elevation = this.points[this.points.length - 1].alt
      } else {
        this.waypoint.elevation = utilities.getElevation(this.points, this.waypoint.location)
      }
      if (this.waypoint._id) {
        await api.updateWaypoint(this.waypoint._id, this.waypoint)
      } else {
        this.waypoint._course = this.course._id
        await api.createWaypoint(this.waypoint)
      }
      this.waypoint = {} // reset form
      await this.refreshWaypoints()
      this.editingWaypoint = false
      this.saving = false
    },
    async saveSegment () {
      this.saving = true
      await api.updateSegment(this.waypoint._id, this.waypoint)
      this.waypoint = {} // reset form
      await this.refreshWaypoints()
      this.saving = false
      this.editingSegment = false
    },
    async refreshWaypoints () {
      this.waypoints = await api.getWaypoints(this.course._id)
    },
    async deleteWaypoint (id) {
      if (confirm('Are you sure you want to delete this waypoint?')) {
        // if we are editing a waypoint we deleted, remove it from the form
        if (this.waypoint._id === id) {
          this.waypoint = {}
          this.editingWaypoint = false
        }
        await api.deleteWaypoint(id)
        await this.refreshWaypoints()
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
    updateChartProfile: function () {
      var data = []
      if (this.points.length < 400) {
        for (var i = 0, il = this.points.length; i < il; i++) {
          data.push({
            x: this.points[i].loc * this.distScale,
            y: this.points[i].alt * this.altScale
          })
        }
      } else {
        var max = this.points[this.points.length - 1].loc
        var xs = []
        for (var j = 0; j <= 400; j++) {
          xs.push((j / 400) * max)
        }
        var ys = utilities.getElevation(this.points, xs)
        for (i = 0, il = xs.length; i < il; i++) {
          data.push({
            x: xs[i] * this.distScale,
            y: ys[i] * this.altScale
          })
        }
      }
      this.chartOptions.scales.xAxes[0].ticks.max = (xs[xs.length - 1] * this.distScale) + 0.01
      this.chartProfile = data
    },
    transparentize: function (color, opacity) {
      var alpha = opacity === undefined ? 0.5 : 1 - opacity
      return Color(color).alpha(alpha).rgbString()
    }
  }
}
</script>
