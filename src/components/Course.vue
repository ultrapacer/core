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
            <course-profile :course="course" :units="units"></course-profile>
          </b-tab>
          <b-tab title="Map" active>
            <course-map :course="course" :focus="mapFocus"></course-map>
          </b-tab>
          <b-tab v-if="course._plan && course._plan.name" title="Plan" active>
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
import api from '@/api'
import util from '../../shared/utilities'
import nF from '../../shared/normFactor'
import CourseMap from './CourseMap'
import CourseProfile from './CourseProfile'
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
    CourseMap,
    CourseProfile,
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
      plan: {},
      planEdit: false,
      segment: {},
      waypoint: {},
      pacing: {},
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
    this.updatePacing()
    this.initializing = false
  },
  methods: {
    async newWaypoint () {
      this.waypoint = {}
    },
    async editWaypoint (waypoint) {
      this.waypoint = waypoint
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
    async refreshWaypoints (callback) {
      this.course.waypoints = await api.getWaypoints(this.course._id)
      this.updatePacing()
      if (typeof callback === 'function') callback()
    },
    async editSegment (waypoint) {
      this.segment = waypoint
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

      // calculate course normalizing factor:
      var tot = 0
      var p = this.course.points
      for (let j = 1, jl = p.length; j < jl; j++) {
        let grd = (p[j - 1].grade + p[j].grade) / 2
        let gF = nF.gradeFactor(grd)
        let aF = nF.altFactor([p[j - 1].alt, p[j].alt], this.course.altModel)
        let dF = nF.driftFactor(
          [p[j - 1].loc, p[j].loc],
          this.course._plan.drift,
          this.course.len
        )
        tot += gF * aF * dF * p[j].dloc
      }
      this.course.norm = (tot / this.course.len)

      // calculate delay:
      var nwp = this.course.waypoints.filter(wp => wp.type === 'aid').length
      var delay = nwp * this.course._plan.waypointDelay

      // calculate time, pace, and normalized pace:
      var time = 0
      var pace = 0
      var np = 0
      if (this.course._plan.pacingMethod === 'time') {
        time = this.course._plan.pacingTarget
        pace = (time - delay) / this.course.len
        np = pace / this.course.norm
      } else if (this.course._plan.pacingMethod === 'pace') {
        pace = this.course._plan.pacingTarget
        time = pace * this.course.len + delay
        np = pace / this.course.norm
      } else if (this.course._plan.pacingMethod === 'np') {
        np = this.course._plan.pacingTarget
        pace = np * this.course.norm
        time = pace * this.course.len + delay
      }

      this.pacing = {
        time: time,
        delay: delay,
        pace: pace,
        np: np,
        drift: this.course._plan.drift,
        altModel: this.course.altModel
      }
    },
    updateFocus: function (focus) {
      this.mapFocus = focus
    }
  }
}
</script>
