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
        <b-tabs v-model="tableTabIndex" content-class="mt-3">
          <b-tab title="Segments" active>
            <segment-table
                ref="segmentTable"
                :course="course"
                :units="units"
                :owner="owner"
                :pacing="pacing"
                @select="updateFocus"
                @show="waypointShow"
                @hide="waypointHide"
              ></segment-table>
          </b-tab>
          <b-tab title="Splits">
            <split-table
                ref="splitTable"
                :course="course"
                :plan="plan"
                :units="units"
                :pacing="pacing"
                @select="updateFocus"
              ></split-table>
          </b-tab>
          <b-tab title="Waypoints">
            <waypoint-table
                ref="waypointTable"
                :course="course"
                :waypoints="course.waypoints"
                :units="units"
                :editing="editing"
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
        </b-tabs>
      </b-col>
      <b-col lg="5" order="1">
        <b-tabs content-class="mt-3" v-if="!initializing" class="sticky-top mt-3">
          <b-tab title="Course">
            <div v-if="showMap">
              <course-profile
                  ref="profile"
                  :course="course"
                  :units="units"
                  :mode="tableTabIndex === 2 ? 'all' : 'filtered'"
                  @waypointClick="waypointClick"
                ></course-profile>
              <course-map
                  ref="map"
                  v-if="showMap"
                  :course="course"
                  :focus="mapFocus"
                  :units="units"
                  :mode="tableTabIndex === 2 ? 'all' : 'filtered'"
                ></course-map>
            </div>
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
      ref="planEdit"
      :course="course"
      :units="units"
      @refresh="refreshPlan"
      @delete="deletePlan"
    ></plan-edit>
    <waypoint-edit
      v-if="editing"
      ref="wpEdit"
      :course="course"
      :units="units"
      :terrainFactors="terrainFactors"
      @refresh="refreshWaypoints"
      @delete="deleteWaypoint"
    ></waypoint-edit>
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
    WaypointEdit
  },
  data () {
    return {
      initializing: true,
      editing: false,
      saving: false,
      course: {},
      plan: {},
      segment: {},
      segmentDisplayTier: 1,
      waypoint: {},
      pacing: {},
      mapFocus: [],
      showMap: false,
      tableTabIndex: 0
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
    terrainFactors: function () {
      if (!this.course.waypoints) { return [] }
      if (!this.course.waypoints.length) { return [] }
      let wps = this.course.waypoints
      let tF = wps[0].terrainFactor
      let tFs = wps.map((x, i) => {
        if (i < wps.length - 1) {
          if (x.terrainFactor !== null) { tF = x.terrainFactor }
          return {
            start: x.location,
            end: wps[i + 1].location,
            tF: tF
          }
        }
      })
      tFs.pop()
      return tFs
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
    this.checkWaypoints()
    this.updatePacing()
    this.initializing = false
    setTimeout(() => {
      this.showMap = true
    }, 500)
  },
  methods: {
    async newWaypoint () {
      this.$refs.wpEdit.show({})
    },
    async editWaypoint (waypoint) {
      this.$refs.wpEdit.show(waypoint)
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
      this.checkWaypoints()
      this.updatePacing()
      if (typeof callback === 'function') callback()
    },
    checkWaypoints () {
      // function ensures start at 0, finish at length,
      // and all waypoints are within course
      let wps = this.course.waypoints
      let start = wps[wps.findIndex(x => x.type === 'start')]
      if (start.location !== 0) {
        console.log('Fixing waypoint: ' + start.name)
        start.location = 0
        api.updateWaypoint(start._id, start)
      }
      let max = (util.round(this.course.len * this.units.distScale, 2) - 0.01)
      max = max / this.units.distScale
      wps.filter(
        x =>
          x.type !== 'start' &&
          x.type !== 'finish' &&
          x.location > max
      ).forEach((x, i) => {
        console.log('Fixing waypoint: ' + x.name)
        wps[i].location = max
        api.updateWaypoint(wps[i]._id, wps[i])
      })
      let finish = wps[wps.findIndex(x => x.type === 'finish')]
      if (util.round(finish.location, 6) !== util.round(this.course.len, 6)) {
        console.log('Fixing waypoint: ' + finish.name)
        finish.location = this.course.len
        api.updateWaypoint(finish._id, finish)
      }
      wps.forEach((x, i) => {
        wps[i].show = x.type === 'start' || x.tier === 1
      })
    },
    async newPlan () {
      this.$refs.planEdit.show()
    },
    async editPlan () {
      this.$refs.planEdit.show(this.course._plan)
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
      var plan = false
      if (this.course._plan && this.course._plan.name) { plan = true }

      // calculate course normalizing factor:
      var tot = 0
      var factors = {gF: 0, aF: 0, tF: 0, dF: 0}
      var p = this.course.points
      for (let j = 1, jl = p.length; j < jl; j++) {
        let grd = (p[j - 1].grade + p[j].grade) / 2
        let gF = nF.gradeFactor(grd)
        let aF = nF.altFactor([p[j - 1].alt, p[j].alt], this.course.altModel)
        let tF = nF.terrainFactor([p[j - 1].loc, p[j].loc], this.terrainFactors)
        let dF = nF.driftFactor(
          [p[j - 1].loc, p[j].loc],
          plan ? this.course._plan.drift : 0,
          this.course.len
        )
        let len = p[j].loc - p[j - 1].loc
        factors.gF += gF * len
        factors.aF += aF * len
        factors.tF += tF * len
        factors.dF += dF * len
        tot += gF * aF * tF * dF * len
      }
      factors.gF = factors.gF / this.course.len
      factors.aF = factors.aF / this.course.len
      factors.tF = factors.tF / this.course.len
      factors.dF = factors.dF / this.course.len
      this.course.norm = (tot / this.course.len)

      let delay = 0
      let time = 0
      let pace = 0
      let np = 0

      if (plan) {
        // calculate delay:
        let wps = this.course.waypoints
        wps.forEach((x, i) => {
          if (x.type === 'aid' || x.type === 'water') {
            wps[i].delay = this.course._plan.waypointDelay
            delay += this.course._plan.waypointDelay
          } else {
            wps[i].delay = 0
          }
        })

        // calculate time, pace, and normalized pace:
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
      }

      this.pacing = {
        time: time,
        delay: delay,
        factors: factors,
        moving: time - delay,
        pace: pace,
        nF: this.course.norm,
        np: np,
        drift: plan ? this.course._plan.drift : 0,
        altModel: this.course.altModel,
        tFs: this.terrainFactors
      }
    },
    updateFocus: function (type, focus) {
      if (type === 'segment') this.$refs.splitTable.clear()
      if (type === 'split') this.$refs.segmentTable.clear()
      this.mapFocus = focus
      this.$refs.profile.focus(focus)
    },
    waypointClick: function (index) {
      this.tableTabIndex = 2
      this.$refs.waypointTable.selectWaypoint(index)
    },
    waypointShow: function (arr) {
      let wps = this.course.waypoints.filter(x => arr.includes(x._id))
      wps.forEach((x, i) => {
        wps[i].show = true
      })
      this.$refs.segmentTable.forceSegmentUpdate()
      this.$refs.profile.forceWaypointsUpdate()
      this.$refs.map.forceUpdate()
    },
    waypointHide: function (arr) {
      let wps = this.course.waypoints.filter(x => arr.includes(x._id))
      wps.forEach((x, i) => {
        wps[i].show = false
      })
      this.$refs.segmentTable.forceSegmentUpdate()
      this.$refs.profile.forceWaypointsUpdate()
      this.$refs.map.forceUpdate()
    }
  }
}
</script>
