<template>
  <div class="container-fluid mt-4">
    <b-row>
      <b-col class="d-none d-md-block">
        <h1 class="h1">{{ course.name }}</h1>
      </b-col>
      <b-col v-if="!initializing" style="text-align:right">
        <b-row>
          <b-col v-if="plansSelect.length" >
            <b-form-group label-size="sm" label="Plan" label-cols="4"  label-cols-lg="2">
              <b-form-select type="number" v-model="course._plan" :options="plansSelect" @change="calcPlan" size="sm"></b-form-select>
            </b-form-group>
          </b-col>
          <b-col cols="4" md="4" lg="3" xl="3" style="text-align:left" v-if="owner && plansSelect.length">
            <b-btn @click="editPlan()" class="mr-1" size="sm">
              <v-icon name="edit"></v-icon>
            </b-btn>
            <b-btn variant="success" @click.prevent="newPlan()" size="sm">
              <v-icon name="plus"></v-icon>
              <span v-if="!plansSelect.length" >New Plan</span>
            </b-btn>
          </b-col>
          <b-col v-if="owner && !plansSelect.length">
            <b-btn variant="success" @click.prevent="newPlan()" size="sm">
              <v-icon name="plus"></v-icon>
              New Plan
            </b-btn>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <div v-if="initializing" class="d-flex justify-content-center mb-3">
      <b-spinner label="Loading..." ></b-spinner>
    </div>
    <b-row v-if="!initializing">
      <b-col order="2">
        <b-tabs content-class="mt-3">
          <b-tab title="Splits" active>
            <split-table :course="course" :plan="plan" :splits="splits" :units="units" :pacing="pacing"></split-table>
          </b-tab>
          <b-tab title="Waypoints">
            <waypoint-table :course="course" :waypoints="course.waypoints" :units="units" :owner="owner" :editFn="editWaypoint" :delFn="deleteWaypoint" :points="points"></waypoint-table>
            <div v-if="owner">
              <b-btn variant="success" @click.prevent="newWaypoint()">
                <v-icon name="plus"></v-icon><span>New Waypoint</span>
              </b-btn>
            </div>
          </b-tab>
          <b-tab title="Segments">
            <segment-table :course="course" :segments="segments" :units="units" :owner="owner" :editFn="editSegment" :pacing="pacing"></segment-table>
          </b-tab>
        </b-tabs>
      </b-col>
      <b-col lg="5" order="1">
        <b-tabs content-class="mt-3" v-if="!initializing" class="sticky-top mt-3" >
          <b-tab title="Profile" >
            <line-chart :chart-data="chartData" :options="chartOptions"></line-chart>
          </b-tab>
          <b-tab title="Map" active>
            <l-map ref="courseMap" style="height: 600px; width: 100%" :center="mapLatLon[1]" :zoom="12">
            <l-tile-layer :url="mapLayerURL"></l-tile-layer>
            <l-polyline
                :lat-lngs="mapLatLon"
                color="red">
            </l-polyline>
            <l-marker v-for="waypoint in course.waypoints" :key="waypoint._id" :lat-lng="[waypoint.lat, waypoint.lon]" ></l-marker>
          </l-map>
          </b-tab>
        </b-tabs>
      </b-col>
    </b-row>
    <plan-edit v-if="owner" :plan="planEdit" :course="course" :points="points" :units="units" @refresh="refreshPlan" @delete="deletePlan"></plan-edit>
    <waypoint-edit v-if="owner" :course="course" :points="points" :waypoint="waypoint" :units="units" @refresh="refreshWaypoints" @delete="deleteWaypoint"></waypoint-edit>
    <segment-edit v-if="owner" :segment="segment" @refresh="refreshWaypoints"></segment-edit>
  </div>
</template>

<script>
import LineChart from './LineChart.js'
import {LMap, LTileLayer, LPolyline, LMarker} from 'vue2-leaflet'
import api from '@/api'
import utilities from '../../shared/utilities'
import gapModel from '../../shared/gapModel'
import SplitTable from './SplitTable'
import SegmentTable from './SegmentTable'
import WaypointTable from './WaypointTable'
import PlanEdit from './PlanEdit'
import WaypointEdit from './WaypointEdit'
import SegmentEdit from './SegmentEdit'

export default {
  title: 'Loading',
  props: ['isAuthenticated', 'user'],
  components: {
    LineChart,
    LMap,
    LTileLayer,
    LPolyline,
    LMarker,
    SplitTable,
    SegmentTable,
    WaypointTable,
    PlanEdit,
    WaypointEdit,
    SegmentEdit
  },
  data () {
    return {
      initializing: true,
      saving: false,
      course: {},
      gradeAdjustment: 0,
      plan: {},
      planEdit: false,
      segment: {},
      waypoint: {},
      pacing: {},
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
      },
      mapLatLon: [],
      mapLayerURL: 'https://b.tile.opentopomap.org/{z}/{x}/{y}.png'
    }
  },
  computed: {
    plansSelect: function () {
      var p = []
      for (var i = 0, il = this.course.plans.length; i < il; i++) {
        p.push({
          value: this.course.plans[i],
          text: this.course.plans[i].name
        })
      }
      return p
    },
    owner: function () {
      if (this.isAuthenticated && String(this.user._id) === String(this.course._user)) {
        return true
      } else {
        return false
      }
    },
    splits: function () {
      return utilities.calcSplits(this.points, this.units.dist, this.pacing)
    },
    segments: function () {
      if (!this.points.length) { return [] }
      if (!this.course.waypoints.length) { return [] }
      var arr = []
      var breaks = []
      for (var i = 0, il = this.course.waypoints.length; i < il; i++) {
        breaks.push(this.course.waypoints[i].location)
      }
      var splits = utilities.calcSegments(this.points, breaks, this.pacing)
      for (var j = 0, jl = splits.length; j < jl; j++) {
        arr.push({
          start: this.course.waypoints[j],
          end: this.course.waypoints[j + 1],
          len: splits[j].len,
          gain: splits[j].gain,
          loss: splits[j].loss,
          grade: splits[j].grade,
          time: splits[j].time
        })
      }
      return arr
    },
    units: function () {
      var u = {
        dist: (this.isAuthenticated) ? this.user.distUnits : 'mi',
        alt: (this.isAuthenticated) ? this.user.elevUnits : 'ft'
      }
      u.distScale = (u.dist === 'mi') ? 0.621371 : 1
      u.altScale = (u.alt === 'ft') ? 3.28084 : 1
      return u
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
      if (!this.course.waypoints.length) { return [] }
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
      for (var i = 0, il = this.course.waypoints.length; i < il; i++) {
        d.data.push({
          x: this.course.waypoints[i].location * this.units.distScale,
          y: this.course.waypoints[i].elevation * this.units.altScale
        })
        if (this.course.waypoints[i].type === 'landmark') {
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
      return d
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
    try {
      this.course = await api.getCourse(this.$route.params.course)
    } catch (err) {
      console.log(err)
      this.$router.push({path: '/'})
      return
    }
    this.$title = this.course.name
    this.points = utilities.addLoc(this.course._gpx.points)
    this.updateMapLatLon()
    this.updateChartProfile()
    // calc grade adjustment:
    var tot = 0
    var grade = 0
    var len = 0
    for (var j = 1, jl = this.points.length; j < jl; j++) {
      len = this.points[j].loc - this.points[j - 1].loc
      grade = (this.points[j].alt - this.points[j - 1].alt) / len / 10
      tot += gapModel(grade) * len
    }
    this.gradeAdjustment = tot / this.points[this.points.length - 1].loc
    this.updatePacing()
    this.initializing = false
  },
  methods: {
    async newWaypoint () {
      this.waypoint = {}
    },
    async refreshWaypoints () {
      this.course.waypoints = await api.getWaypoints(this.course._id)
    },
    async deleteWaypoint (waypoint, cb) {
      setTimeout(async () => {
        if (confirm('Are you sure you want to delete this waypoint?\n' + waypoint.name)) {
          // if we are editing a waypoint we deleted, remove it from the form
          if (this.waypoint._id === waypoint._id) {
            this.waypoint = {}
          }
          await api.deleteWaypoint(waypoint._id)
          var index = this.course.waypoints.indexOf(waypoint)
          if (index > -1) {
            this.course.waypoints.splice(index, 1)
          }
          if (cb) { cb() }
        } else {
          if (cb) cb(new Error('not deleted'))
        }
      }, 100)
    },
    async editWaypoint (waypoint) {
      this.waypoint = waypoint
    },
    async editSegment (waypoint) {
      this.segment = waypoint
    },
    updateChartProfile: function () {
      var data = []
      if (this.points.length < 400) {
        for (var i = 0, il = this.points.length; i < il; i++) {
          data.push({
            x: this.points[i].loc * this.units.distScale,
            y: this.points[i].alt * this.units.altScale
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
            x: xs[i] * this.units.distScale,
            y: ys[i] * this.units.altScale
          })
        }
      }
      this.chartOptions.scales.xAxes[0].ticks.max = (xs[xs.length - 1] * this.units.distScale) + 0.01
      this.chartProfile = data
    },
    transparentize: function (color, opacity) {
      var alpha = opacity === undefined ? 0.5 : 1 - opacity
      return window.Color(color).alpha(alpha).rgbString()
    },
    updateMapLatLon: function () {
      var arr = []
      for (var i = 0, il = this.points.length; i < il; i++) {
        arr.push([this.points[i].lat, this.points[i].lon])
      }
      this.mapLatLon = arr
    },
    async newPlan () {
      this.planEdit = {}
    },
    async editPlan () {
      this.planEdit = Object.assign({}, this.course._plan)
    },
    async deletePlan (plan, cb) {
      setTimeout(async () => {
        if (confirm('Are you sure you want to delete this plan?\n' + plan.name)) {
          await api.deletePlan(plan._id)
          if (this.course._plan._id === plan._id) {
            this.course._plan = {}
            this.pacing = {}
          }
          this.course.plans = await api.getPlans(this.course._id)
          if (cb) { cb() }
        } else {
          if (cb) cb(new Error('not deleted'))
        }
      }, 100)
    },
    async refreshPlan (plan) {
      this.course.plans = await api.getPlans(this.course._id)
      for (var i = 0, il = this.course.plans.length; i < il; i++) {
        if (this.course.plans[i]._id === plan._id) {
          this.course._plan = this.course.plans[i]
        }
      }
      this.calcPlan()
    },
    calcPlan () {
      if (!this.course._plan) { return }
      if (this.owner) {
        api.selectCoursePlan(this.course._id, {plan: this.course._plan._id})
      }
      this.updatePacing()
    },
    updatePacing () {
      if (!this.course._plan) { return }
      var time = 0
      var delay = 0
      var pace = 0
      var gap = 0

      for (var i = 0, il = this.course.waypoints.length; i < il; i++) {
        if (this.course.waypoints[i].type === 'aid') {
          delay += this.course._plan.waypointDelay
        }
      }

      if (this.course._plan.pacingMethod === 'time') {
        time = this.course._plan.pacingTarget
        pace = (time - delay) / this.points[this.points.length - 1].loc
        gap = pace / this.gradeAdjustment
      } else if (this.course._plan.pacingMethod === 'pace') {
        pace = this.course._plan.pacingTarget
        time = pace * this.points[this.points.length - 1].loc + delay
        gap = pace / this.gradeAdjustment
      } else if (this.course._plan.pacingMethod === 'gap') {
        gap = this.course._plan.pacingTarget
        pace = gap * this.gradeAdjustment
        time = pace * this.points[this.points.length - 1].loc + delay
      }
      this.pacing = {
        time: time,
        delay: delay,
        pace: pace,
        gap: gap
      }
    }
  }
}
</script>
