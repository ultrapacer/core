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
            <split-table
                :course="course"
                :plan="plan"
                :splits="splits"
                :units="units"
                :pacing="pacing"
                @select="updateFocus"
              ></split-table>
          </b-tab>
          <b-tab title="Waypoints">
            <waypoint-table
                :course="course"
                :waypoints="course.waypoints"
                :units="units"
                :owner="owner"
                :editFn="editWaypoint"
                :delFn="deleteWaypoint"
              ></waypoint-table>
            <div v-if="owner">
              <b-btn variant="success" @click.prevent="newWaypoint()">
                <v-icon name="plus"></v-icon><span>New Waypoint</span>
              </b-btn>
            </div>
          </b-tab>
          <b-tab title="Segments">
            <segment-table
                :course="course"
                :segments="segments"
                :units="units"
                :owner="owner"
                :editFn="editSegment"
                :pacing="pacing"
                @select="updateFocus"
              ></segment-table>
          </b-tab>
        </b-tabs>
      </b-col>
      <b-col lg="5" order="1">
        <b-tabs content-class="mt-3" v-if="!initializing" class="sticky-top mt-3" >
          <b-tab title="Profile" >
            <line-chart :chart-data="chartData" :options="chartOptions">
            </line-chart>
          </b-tab>
          <b-tab title="Map" active>
            <course-map :course="course" :focus="mapFocus"></course-map>
          </b-tab>
          <b-tab v-if="course._plan && course._plan.name" title="Plan">
            <plan-details
                :course="course"
                :plan="course._plan"
                :pacing="pacing"
                :units="units"
              ></plan-details>
          </b-tab>
        </b-tabs>
      </b-col>
    </b-row>
    <plan-edit
      v-if="owner"
      :plan="planEdit"
      :course="course"
      :units="units"
      @refresh="refreshPlan"
      @delete="deletePlan"
    ></plan-edit>
    <waypoint-edit
      v-if="owner"
      :course="course"
      :waypoint="waypoint"
      :units="units"
      @refresh="refreshWaypoints"
      @delete="deleteWaypoint"
    ></waypoint-edit>
    <segment-edit
      v-if="owner"
      :segment="segment"
      @refresh="refreshWaypoints"
    ></segment-edit>
    <delete-modal
      ref="delModal"
    ></delete-modal>
  </div>
</template>

<script>
import LineChart from './LineChart.js'
import api from '@/api'
import util from '../../shared/utilities'
import gnpFactor from '../../shared/gnp'
import CourseMap from './CourseMap'
import DeleteModal from './DeleteModal'
import SplitTable from './SplitTable'
import SegmentTable from './SegmentTable'
import WaypointTable from './WaypointTable'
import PlanDetails from './PlanDetails'
import PlanEdit from './PlanEdit'
import WaypointEdit from './WaypointEdit'
import SegmentEdit from './SegmentEdit'

export default {
  title: 'Loading',
  props: ['isAuthenticated', 'user'],
  components: {
    LineChart,
    CourseMap,
    DeleteModal,
    SplitTable,
    SegmentTable,
    WaypointTable,
    PlanDetails,
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
      chartGrade: [],
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
          }],
          yAxes: [{
            display: true,
            position: 'left',
            id: 'y-axis-1'
          }, {
            type: 'linear',
            display: true,
            position: 'right',
            id: 'y-axis-2'
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
      mapFocus: []
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
      return util.calcSplits(this.course.points, this.units.dist, this.pacing)
    },
    segments: function () {
      if (!this.course.points.length) { return [] }
      if (!this.course.waypoints.length) { return [] }
      var arr = []
      var breaks = []
      for (var i = 0, il = this.course.waypoints.length; i < il; i++) {
        breaks.push(this.course.waypoints[i].location)
      }
      var splits = util.calcSegments(this.course.points, breaks, this.pacing)
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
            backgroundColor: this.transparentize(this.chartColors.blue),
            yAxisID: 'y-axis-1'
          },
          { data: this.chartGrade,
            pointRadius: 0,
            pointHoverRadius: 0,
            showLine: true,
            yAxisID: 'y-axis-2'
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
    util.addLoc(this.course.points)
    this.course.len = this.course.points[this.course.points.length - 1].loc
    this.updateChartProfile()
    // calc grade adjustment:
    var tot = 0
    var p = this.course.points
    for (var j = 1, jl = p.length; j < jl; j++) {
      var grd = (p[j - 1].grade + p[j].grade) / 2
      tot += (1 + gnpFactor(grd)) * p[j].dloc
    }
    this.gradeAdjustment = tot / p[p.length - 1].loc
    this.updatePacing()
    this.initializing = false
  },
  methods: {
    async newWaypoint () {
      this.waypoint = {}
    },
    async refreshWaypoints (callback) {
      this.course.waypoints = await api.getWaypoints(this.course._id)
      this.updatePacing()
      if (typeof callback === 'function') callback()
    },
    async deleteWaypoint (waypoint, cb) {
      this.$refs.delModal.show(
        'Waypoint',
        waypoint,
        async () => {
          // if we are editing a waypoint we deleted, remove it from the form
          if (this.waypoint._id === waypoint._id) {
            this.waypoint = {}
          }
          await api.deleteWaypoint(waypoint._id)
          var index = this.course.waypoints.findIndex(x => x._id === waypoint._id)
          if (index > -1) {
            this.course.waypoints.splice(index, 1)
          }
        },
        (err) => {
          if (typeof (cb) === 'function') {
            if (err) cb(err)
            else cb()
          }
        }
      )
    },
    async editWaypoint (waypoint) {
      this.waypoint = waypoint
    },
    async editSegment (waypoint) {
      this.segment = waypoint
    },
    updateChartProfile: function () {
      var pmax = 500 // number of points (+1)
      var xs = [] // x's array
      var ysa = [] // y's array for altitude
      var ysg = [] // y's array for grade
      var chartProfile = []
      var chartGrade = []
      if (this.course.points.length < pmax) {
        xs = this.course.points.map(x => x.loc)
        ysa = this.course.points.map(x => x.alt)
        ysg = this.course.points.map(x => x.grade)
      } else {
        xs = Array(pmax + 1).fill(0).map((e, i) => i++ * this.course.len / pmax)
        ysa = util.pointWLSQ(
          this.course.points,
          xs,
          this.course.len / pmax / 5
        )
        ysg = util.pointWLSQ(
          this.course.points,
          xs,
          5 * this.course.len / pmax
        )
      }
      xs.forEach((x, i) => {
        chartProfile.push({
          x: x * this.units.distScale,
          y: ysa[i].alt * this.units.altScale
        })
        chartGrade.push({
          x: x * this.units.distScale,
          y: ysg[i].grade
        })
      })
      // this is a hack to make the finish waypoint show up:
      this.chartOptions.scales.xAxes[0].ticks.max = (
        (xs[xs.length - 1] * this.units.distScale) + 0.01
      )
      this.chartProfile = chartProfile
      this.chartGrade = chartGrade
    },
    transparentize: function (color, opacity) {
      var alpha = opacity === undefined ? 0.5 : 1 - opacity
      return window.Color(color).alpha(alpha).rgbString()
    },
    async newPlan () {
      this.planEdit = {}
    },
    async editPlan () {
      this.planEdit = Object.assign({}, this.course._plan)
    },
    async deletePlan (plan, cb) {
      this.$refs.delModal.show(
        'Plan',
        plan,
        async () => {
          await api.deletePlan(plan._id)
          if (this.course._plan._id === plan._id) {
            this.course._plan = {}
            this.pacing = {}
          }
          this.course.plans = await api.getPlans(this.course._id)
        },
        (err) => {
          if (typeof (cb) === 'function') {
            if (err) cb(err)
            else cb()
          }
        }
      )
    },
    async refreshPlan (plan, callback) {
      this.course.plans = await api.getPlans(this.course._id)
      for (var i = 0, il = this.course.plans.length; i < il; i++) {
        if (this.course.plans[i]._id === plan._id) {
          this.course._plan = this.course.plans[i]
        }
      }
      this.calcPlan()
      if (typeof callback === 'function') callback()
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
      if (!this.course._plan.name) { return }
      var time = 0
      var pace = 0
      var gnp = 0
      var l = this.course.points[this.course.points.length - 1].loc

      var nwp = this.course.waypoints.filter(wp => wp.type === 'aid').length
      var delay = nwp * this.course._plan.waypointDelay

      if (this.course._plan.pacingMethod === 'time') {
        time = this.course._plan.pacingTarget
        pace = (time - delay) / l
        gnp = pace / this.gradeAdjustment
      } else if (this.course._plan.pacingMethod === 'pace') {
        pace = this.course._plan.pacingTarget
        time = pace * l + delay
        gnp = pace / this.gradeAdjustment
      } else if (this.course._plan.pacingMethod === 'gnp') {
        gnp = this.course._plan.pacingTarget
        pace = gnp * this.gradeAdjustment
        time = pace * l + delay
      }
      this.pacing = {
        time: time,
        delay: delay,
        pace: pace,
        gnp: gnp,
        drift: this.course._plan.drift
      }
    },
    updateFocus: function (focus) {
      this.mapFocus = focus
    }
  }
}
</script>
